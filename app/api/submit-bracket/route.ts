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

    const queryResponse = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          filter: {
            property: "Email",
            email: {
              equals: email,
            },
          },
        }),
      }
    );

    const existingEntries = await queryResponse.json();

    if (!queryResponse.ok) {
      console.error("NOTION QUERY ERROR:", existingEntries);
      throw new Error(existingEntries.message || "Failed to query Notion");
    }

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

      const updateResponse = await fetch(
        `https://api.notion.com/v1/pages/${existingPage.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({
            properties,
          }),
        }
      );

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        console.error("NOTION UPDATE ERROR:", updateData);
        throw new Error(updateData.message || "Failed to update Notion page");
      }

      return Response.json({
        success: true,
        updated: true,
        pageId: updateData.id,
      });
    }

    const createResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: {
          database_id: process.env.NOTION_DATABASE_ID,
        },
        properties,
      }),
    });

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      console.error("NOTION CREATE ERROR:", createData);
      throw new Error(createData.message || "Failed to create Notion page");
    }

    return Response.json({
      success: true,
      updated: false,
      pageId: createData.id,
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