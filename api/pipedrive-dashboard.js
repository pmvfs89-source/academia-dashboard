const OWNER_IDS = [23281672, 30036684, 30036673];

function getOwnerId(item) {
  return Number(
    item?.user_id?.value ||
      item?.user_id?.id ||
      item?.user_id ||
      item?.owner_id?.id ||
      item?.owner_id ||
      item?.assigned_to_user_id ||
      0
  );
}

async function pipedriveFetch(path) {
  const token = process.env.PIPEDRIVE_API_TOKEN;

  if (!token) {
    throw new Error("Missing PIPEDRIVE_API_TOKEN");
  }

  const url = new URL(`https://api.pipedrive.com/v1/${path}`);
  url.searchParams.set("api_token", token);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Pipedrive error ${response.status}`);
  }

  const json = await response.json();
  return json.data || [];
}

function makeLookup(items) {
  return Object.fromEntries(
    (items || []).map((item) => [Number(item.id), item.name])
  );
}

export default async function handler(req, res) {
  try {
    const [dealsRaw, activitiesRaw, stagesRaw, pipelinesRaw] =
      await Promise.all([
        pipedriveFetch("deals?limit=500"),
        pipedriveFetch("activities?limit=500"),
        pipedriveFetch("stages"),
        pipedriveFetch("pipelines"),
      ]);

    const stageLookup = makeLookup(stagesRaw);
    const pipelineLookup = makeLookup(pipelinesRaw);

    const deals = dealsRaw
      .filter((deal) => OWNER_IDS.includes(getOwnerId(deal)))
      .map((deal) => ({
        id: deal.id,
        title: deal.title,
        owner_id: getOwnerId(deal),
        pipeline_id: deal.pipeline_id,
        pipeline: pipelineLookup[Number(deal.pipeline_id)] || `Pipeline ${deal.pipeline_id}`,
        stage_id: deal.stage_id,
        stage: stageLookup[Number(deal.stage_id)] || `Stage ${deal.stage_id}`,
        status: deal.status,
        value: Number(deal.value || 0),
        expectedClose: deal.expected_close_date,
        wonDate: deal.won_time,
        hasNextActivity: Boolean(deal.next_activity_date),
        lostReason: deal.lost_reason,
      }));

    const activities = activitiesRaw
      .filter((activity) => OWNER_IDS.includes(getOwnerId(activity)))
      .map((activity) => ({
        id: activity.id,
        owner_id: getOwnerId(activity),
        deal_id: activity.deal_id,
        type: activity.type,
        status: activity.done ? "done" : "planned",
        dueDate: activity.due_date,
      }));

    return res.status(200).json({
      deals,
      activities,
      elearning: null,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
