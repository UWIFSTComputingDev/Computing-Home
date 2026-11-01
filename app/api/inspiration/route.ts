import { NextResponse } from "next/server"

const COMMONS_TOPICS = [
  "computer laboratory",
  "computer server room",
  "early personal computer",
  "computer circuit board",
]

const WIKIPEDIA_TOPICS = [
  "computer science",
  "computer programming",
  "computer hardware",
  "computer network",
  "cryptography",
  "algorithm",
  "operating system",
]

type MetadataValue = {
  value?: string
}

type CommonsPage = {
  title?: string
  imageinfo?: Array<{
    thumburl?: string
    descriptionurl?: string
    extmetadata?: {
      Artist?: MetadataValue
      LicenseShortName?: MetadataValue
    }
  }>
}

type CommonsResponse = {
  query?: {
    pages?: Record<string, CommonsPage>
  }
}

type WikipediaPage = {
  title?: string
  extract?: string
  fullurl?: string
}

type WikipediaResponse = {
  query?: {
    pages?: Record<string, WikipediaPage>
  }
}

function randomItem<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

function cleanMetadata(value: string | undefined): string {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function shortenExtract(extract: string): string {
  const normalized = extract.replace(/\s+/g, " ").trim()
  if (normalized.length <= 260) return normalized

  const wordBoundary = normalized.lastIndexOf(" ", 257)
  return `${normalized.slice(0, wordBoundary > 180 ? wordBoundary : 257).trimEnd()}…`
}

function buildApiUrl(base: string, values: Record<string, string>): string {
  const url = new URL(base)
  for (const [key, value] of Object.entries(values)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

async function fetchComputingImage() {
  const topic = randomItem(COMMONS_TOPICS)
  const url = buildApiUrl("https://commons.wikimedia.org/w/api.php", {
    action: "query",
    generator: "search",
    gsrsearch: topic,
    gsrnamespace: "6",
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1600",
    format: "json",
  })

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "ComputingHome/1.0 (https://github.com/UWIFSTComputingDev/Computing-Home)",
    },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) {
    throw new Error(`Wikimedia Commons returned ${response.status}.`)
  }

  const data = (await response.json()) as CommonsResponse
  const candidates = Object.values(data.query?.pages ?? {}).flatMap((page) => {
    const imageInfo = page.imageinfo?.[0]
    if (!page.title || !imageInfo?.thumburl || !imageInfo.descriptionurl) return []

    const license = cleanMetadata(imageInfo.extmetadata?.LicenseShortName?.value)
    if (!/^(?:CC0|CC BY(?:-SA)?(?:\s|$)|Public domain|GFDL|GNU Free Documentation License)/i.test(license)) {
      return []
    }

    const imageUrl = new URL(imageInfo.thumburl)
    const descriptionUrl = new URL(imageInfo.descriptionurl)
    if (
      imageUrl.protocol !== "https:" ||
      !["upload.wikimedia.org", "thumb.wikimedia.org"].includes(imageUrl.hostname) ||
      descriptionUrl.protocol !== "https:" ||
      descriptionUrl.hostname !== "commons.wikimedia.org"
    ) {
      return []
    }

    return [{
      title: page.title.replace(/^File:/, ""),
      imageUrl: imageUrl.toString(),
      sourceUrl: descriptionUrl.toString(),
      artist: cleanMetadata(imageInfo.extmetadata?.Artist?.value) || "Wikimedia Commons contributor",
      license,
    }]
  })

  if (candidates.length === 0) {
    throw new Error(`Wikimedia Commons returned no usable images for "${topic}".`)
  }

  return randomItem(candidates)
}

async function fetchComputingFact() {
  const topic = randomItem(WIKIPEDIA_TOPICS)
  const url = buildApiUrl("https://en.wikipedia.org/w/api.php", {
    action: "query",
    generator: "search",
    gsrsearch: topic,
    gsrnamespace: "0",
    gsrlimit: "10",
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    exchars: "520",
    inprop: "url",
    format: "json",
  })

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "ComputingHome/1.0 (https://github.com/UWIFSTComputingDev/Computing-Home)",
    },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) {
    throw new Error(`Wikipedia returned ${response.status}.`)
  }

  const data = (await response.json()) as WikipediaResponse
  const candidates = Object.values(data.query?.pages ?? {}).filter(
    (page) =>
      page.title &&
      page.extract &&
      page.fullurl &&
      !/^(list of|glossary of|outline of)/i.test(page.title),
  )

  if (candidates.length === 0) {
    throw new Error(`Wikipedia returned no usable articles for "${topic}".`)
  }

  const article = randomItem(candidates)
  return {
    title: article.title!,
    extract: shortenExtract(article.extract!),
    sourceUrl: article.fullurl!,
  }
}

export async function GET() {
  try {
    const [image, fact] = await Promise.all([
      fetchComputingImage(),
      fetchComputingFact(),
    ])

    return NextResponse.json(
      { image, fact },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    )
  } catch (error) {
    console.error("Unable to load computing inspiration.", error)
    return NextResponse.json(
      { error: "Computing inspiration is temporarily unavailable." },
      {
        status: 502,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    )
  }
}
