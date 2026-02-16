import { db } from "@/lib/db";

export async function provisionInstance(userId: string, plan: string) {
  // Placeholder: simulate provisioning delay
  const instance = await db.instance.update({
    where: { userId },
    data: { status: "provisioning" },
  });

  // Simulate async provisioning (3 seconds)
  setTimeout(async () => {
    try {
      const endpoint = `https://${instance.id}.openclaw.app`;
      await db.instance.update({
        where: { id: instance.id },
        data: { status: "active", endpoint },
      });
      await db.auditLog.create({
        data: {
          userId,
          action: "instance.provisioned",
          details: `Plan: ${plan}, Endpoint: ${endpoint}`,
        },
      });
      console.log(`[OPENCLAW] Instance ${instance.id} provisioned → ${endpoint}`);
    } catch (err) {
      console.error(`[OPENCLAW] Failed to provision instance ${instance.id}:`, err);
    }
  }, 3000);

  return instance;
}

export async function deprovisionInstance(instanceId: string) {
  const instance = await db.instance.update({
    where: { id: instanceId },
    data: { status: "deprovisioned", endpoint: null },
  });
  await db.auditLog.create({
    data: {
      userId: instance.userId,
      action: "instance.deprovisioned",
    },
  });
  console.log(`[OPENCLAW] Instance ${instanceId} deprovisioned`);
  return instance;
}

export async function suspendInstance(instanceId: string) {
  const instance = await db.instance.update({
    where: { id: instanceId },
    data: { status: "suspended" },
  });
  await db.auditLog.create({
    data: {
      userId: instance.userId,
      action: "instance.suspended",
    },
  });
  console.log(`[OPENCLAW] Instance ${instanceId} suspended`);
  return instance;
}

export async function resumeInstance(instanceId: string) {
  const instance = await db.instance.update({
    where: { id: instanceId },
    data: { status: "active" },
  });
  await db.auditLog.create({
    data: {
      userId: instance.userId,
      action: "instance.resumed",
    },
  });
  console.log(`[OPENCLAW] Instance ${instanceId} resumed`);
  return instance;
}

export async function getInstanceStatus(instanceId: string) {
  return db.instance.findUnique({
    where: { id: instanceId },
    select: { id: true, status: true, endpoint: true, plan: true, region: true, createdAt: true },
  });
}

export async function updateApiKey(instanceId: string, apiKeyHash: string) {
  const instance = await db.instance.update({
    where: { id: instanceId },
    data: { apiKeyHash },
  });
  await db.auditLog.create({
    data: {
      userId: instance.userId,
      action: "apikey.updated",
    },
  });
  console.log(`[OPENCLAW] API key updated for instance ${instanceId}`);
  return instance;
}
