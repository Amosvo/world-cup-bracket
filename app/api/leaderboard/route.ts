import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function GET() {
  try {
    if (!process.env.NOTION_DATABASE_ID) {
      throw new Error("Missing NOTION_DATABASE_ID");
    }

    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          sorts: [
            {
              property: "Total Points",
              direction: "descending",
            },
          ],
          page_size: 30,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("LEADERBOARD NOTION API ERROR:", data);
      throw new Error(data.message || "Failed to fetch leaderboard");
    }

    const leaderboard = data.results.map((page: any) => {
      const properties = page.properties;

      return {
        id: page.id,
        name: properties.Name?.title?.[0]?.plain_text || "Unnamed Player",
        champion: properties.Champion?.rich_text?.[0]?.plain_text || "TBD",
        points: properties["Total Points"]?.number || 0,
      };
    });

    return Response.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("LEADERBOARD ERROR:", error);

    return Response.json(
      {
        success: false,
        leaderboard: [],
      },
      { status: 500 }
    );
  }
}