import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const SUBMISSION_DEADLINE = new Date("2026-06-27T23:59:00-05:00");

export async function POST(request: Request) {
  try {
    if (new Date() > SUBMISSION_DEADLINE) {
      return Response.json(
        {
          success: false,
          error: "Submissions are now closed.",
        },
        { status: 403 }
      );
    }

    if (!process.env.NOTION_TOKEN) {
      throw new Error("Missing NOTION_TOKEN");
    }

    if (!process.env.NOTION_DATABASE_ID) {
      throw new Error("Missing NOTION_DATABASE_ID");
    }

    const body = await request.json();

    const {
      name,
      email,
      champion,
      roundOf32,
      roundOf16,
      quarterfinals,
      semifinals,
    } = body;

    if (!email) {
      return Response.json(
        {
          success: false,
          error: "Email is required so we can keep one entry per person.",
        },
        { status: 400 }
      );
    }

    const existingEntries = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: "Email",
        email: {
          equals: email,
        },
      },
    });

    const properties = {
      Name: {
        title: [
          {
            text: {
              content: name || "Unnamed Entry",
            },
          },
        ],
      },
      Email: {
        email,
      },
      Champion: {
        rich_text: [
          {
            text: {
              content: champion || "",
            },
          },
        ],
      },
      "Submitted At": {
        date: {
          start: new Date().toISOString(),
        },
      },
      "Round of 32": {
        rich_text: [
          {
            text: {
              content: JSON.stringify(roundOf32 || []),
            },
          },
        ],
      },
      "Round of 16": {
        rich_text: [
          {
            text: {
              content: JSON.stringify(roundOf16 || []),
            },
          },
        ],
      },
      Quarterfinals: {
        rich_text: [
          {
            text: {
              content: JSON.stringify(quarterfinals || []),
            },
          },
        ],
      },
      Semifinals: {
        rich_text: [
          {
            text: {
              content: JSON.stringify(semifinals || []),
            },
          },
        ],
      },
      "Total Points": {
        number: 0,
      },
    };

    if (existingEntries.results.length > 0) {
      const existingPage = existingEntries.results[0];

      const response = await notion.pages.update({
        page_id: existingPage.id,
        properties,
      });

      return Response.json({
        success: true,
        updated: true,
        pageId: response.id,
      });
    }

    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties,
    });

    return Response.json({
      success: true,
      updated: false,
      pageId: response.id,
    });
  } catch (error) {
    console.error("NOTION SUBMISSION ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}