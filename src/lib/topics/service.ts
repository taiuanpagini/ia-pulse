import { connectDB } from "@/lib/mongodb/client";
import { TOPIC_COLOR_PALETTE } from "@/lib/mongodb/models/Topic";
import { CreateTopicInput, TopicResponse } from "./schemas";
import {
  findAllTopics,
  findTopicBySlug,
  createTopic as repoCreate,
  updateTopicDescription,
  countTopics,
} from "./repository";
import { ITopic } from "@/lib/mongodb/models/Topic";

export class SlugConflictError extends Error {
  code = "SLUG_CONFLICT";
  constructor(slug: string) {
    super(`Slug já existe: ${slug}`);
  }
}

function generateSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toTopicResponse(topic: ITopic & { _id?: unknown }): TopicResponse {
  return {
    id: String(topic._id ?? ""),
    name: topic.name,
    slug: topic.slug,
    description: topic.description,
    color: topic.color,
  };
}

export async function listTopics(): Promise<TopicResponse[]> {
  await connectDB();
  const topics = await findAllTopics();
  return topics.map(toTopicResponse);
}

export async function createTopicService(
  input: CreateTopicInput
): Promise<TopicResponse> {
  await connectDB();

  const slug = input.slug ?? generateSlug(input.name);

  const existing = await findTopicBySlug(slug);
  if (existing) throw new SlugConflictError(slug);

  const count = await countTopics();
  const color = TOPIC_COLOR_PALETTE[count % TOPIC_COLOR_PALETTE.length];

  const topic = await repoCreate({
    name: input.name,
    slug,
    description: input.description ?? "",
    color,
  });

  return toTopicResponse(topic);
}

export async function updateTopicDescriptionService(
  slug: string,
  description: string
): Promise<TopicResponse | null> {
  await connectDB();
  const topic = await updateTopicDescription(slug, description);
  if (!topic) return null;
  return toTopicResponse(topic);
}
