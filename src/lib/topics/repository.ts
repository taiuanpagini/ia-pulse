import { Topic, ITopic, TOPIC_COLOR_PALETTE } from "@/lib/mongodb/models/Topic";

export async function findAllTopics(): Promise<ITopic[]> {
  return Topic.find({}).sort({ name: 1 }).lean() as unknown as ITopic[];
}

export async function findTopicBySlug(slug: string): Promise<ITopic | null> {
  return Topic.findOne({ slug }).lean() as unknown as ITopic | null;
}

export async function createTopic(data: {
  name: string;
  slug: string;
  description: string;
  color: (typeof TOPIC_COLOR_PALETTE)[number];
}): Promise<ITopic> {
  const topic = await Topic.create(data);
  return topic.toObject() as ITopic;
}

export async function updateTopicDescription(
  slug: string,
  description: string
): Promise<ITopic | null> {
  return Topic.findOneAndUpdate(
    { slug },
    { $set: { description } },
    { new: true }
  ).lean() as unknown as ITopic | null;
}

export async function countTopics(): Promise<number> {
  return Topic.countDocuments();
}
