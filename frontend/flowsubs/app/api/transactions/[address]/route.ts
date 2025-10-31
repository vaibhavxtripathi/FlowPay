import { NextRequest, NextResponse } from "next/server";

// Types for subscription events
export interface SubscriptionEvent {
  id: string;
  type: "PayoutCreated" | "PayoutExecuted" | "PayoutCanceled";
  subscriptionID: string;
  payer: string;
  payee: string;
  amount?: string;
  interval?: number;
  gracePeriod?: number;
  timestamp: string;
  blockHeight: number;
  transactionId: string;
}

// FindLabs API configuration
const FINDLABS_API_BASE =
  process.env.FINDLABS_BASE ||
  process.env.FINDLABS_API_BASE ||
  "https://api.findlabs.io";
const FLOW_ACCESS_NODE = "https://rest-testnet.onflow.org";
const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xDeployer"
).toLowerCase();
const CONTRACT_NAME =
  process.env.NEXT_PUBLIC_CONTRACT_NAME || "SubscriptionManagerV2";

// Helper function to fetch events from FindLabs indexer
async function fetchEventsFromFindLabs(
  address: string
): Promise<SubscriptionEvent[]> {
  try {
    // FindLabs uses REST API with query parameters, not POST
    const contractAddress = CONTRACT_ADDRESS; // Set via NEXT_PUBLIC_CONTRACT_ADDRESS

    // Query for all subscription events in parallel
    const aPrefix = `A.${contractAddress.replace(/^0x/, "")}.${CONTRACT_NAME}`;
    const eventTypes = [
      `${aPrefix}.SubscriptionCreated`,
      `${aPrefix}.SubscriptionPaid`,
      `${aPrefix}.SubscriptionCanceled`,
    ];

    const headers: Record<string, string> = {};
    if (process.env.FINDLABS_API_KEY) {
      headers["Authorization"] = `Bearer ${process.env.FINDLABS_API_KEY}`;
    } else if (process.env.FINDLABS_USER && process.env.FINDLABS_PASS) {
      const basic = Buffer.from(
        `${process.env.FINDLABS_USER}:${process.env.FINDLABS_PASS}`
      ).toString("base64");
      headers["Authorization"] = `Basic ${basic}`;
    }
    const eventPromises = eventTypes.map((eventType) =>
      fetch(
        `${FINDLABS_API_BASE}/api/v1/events?network=testnet&contract_address=${contractAddress}&event_type=${eventType}&account_address=${address}&limit=100`,
        { headers }
      )
    );

    const responses = await Promise.all(eventPromises);
    const data = await Promise.all(responses.map((r) => r.json()));

    // Transform and combine events
    const events: SubscriptionEvent[] = [];

    // Process created events
    if (data[0]?.events) {
      data[0].events.forEach((event: any) => {
        events.push({
          id: `${event.transaction_id}-${event.event_index}`,
          type: "PayoutCreated",
          subscriptionID:
            event.event_data?.subscriptionID || event.data?.subscriptionID,
          payer: event.event_data?.payer || event.data?.payer,
          payee: event.event_data?.payee || event.data?.payee,
          amount: event.event_data?.amount || event.data?.amount,
          interval: parseInt(
            event.event_data?.interval || event.data?.interval || "0"
          ),
          gracePeriod: parseInt(
            event.event_data?.gracePeriod || event.data?.gracePeriod || "0"
          ),
          timestamp: event.timestamp || new Date().toISOString(),
          blockHeight: event.block_height || 0,
          transactionId: event.transaction_id,
        });
      });
    }

    // Process paid events
    if (data[1]?.events) {
      data[1].events.forEach((event: any) => {
        events.push({
          id: `${event.transaction_id}-${event.event_index}`,
          type: "PayoutExecuted",
          subscriptionID:
            event.event_data?.subscriptionID || event.data?.subscriptionID,
          payer: event.event_data?.payer || event.data?.payer,
          payee: event.event_data?.payee || event.data?.payee,
          amount: event.event_data?.amount || event.data?.amount,
          timestamp: event.timestamp || new Date().toISOString(),
          blockHeight: event.block_height || 0,
          transactionId: event.transaction_id,
        });
      });
    }

    // Process canceled events
    if (data[2]?.events) {
      data[2].events.forEach((event: any) => {
        events.push({
          id: `${event.transaction_id}-${event.event_index}`,
          type: "PayoutCanceled",
          subscriptionID:
            event.event_data?.subscriptionID || event.data?.subscriptionID,
          payer: event.event_data?.payer || event.data?.payer,
          payee: event.event_data?.payee || event.data?.payee,
          timestamp: event.timestamp || new Date().toISOString(),
          blockHeight: event.block_height || 0,
          transactionId: event.transaction_id,
        });
      });
    }

    // Sort by timestamp (most recent first)
    return events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.warn(
      "FindLabs API failed, falling back to Flow Access Node:",
      error
    );
    return fetchEventsFromFlowNode(address);
  }
}

// Fallback function to fetch events directly from Flow Access Node
async function fetchEventsFromFlowNode(
  address: string
): Promise<SubscriptionEvent[]> {
  try {
    // This is a simplified implementation - in production you'd want more robust event querying
    // Flow Access Node has limitations for complex event queries, so FindLabs is preferred

    const events: SubscriptionEvent[] = [];

    // For demo purposes, return empty array - in production implement direct node queries
    // You would use Flow's gRPC API or REST endpoints to query events

    console.log(
      `Fallback: Would query Flow Access Node for events related to ${address}`
    );
    return events;
  } catch (error) {
    console.error("Flow Access Node query failed:", error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const resolvedParams = await params;
    const address = resolvedParams.address;

    // Validate Flow address format
    if (!address || !address.startsWith("0x") || address.length !== 18) {
      return NextResponse.json(
        { error: "Invalid Flow address format" },
        { status: 400 }
      );
    }

    // Try FindLabs first, fallback to Flow Access Node
    const events = await fetchEventsFromFindLabs(address);

    return NextResponse.json({
      address,
      events,
      count: events.length,
      source: events.length > 0 ? "findlabs" : "fallback",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription events" },
      { status: 500 }
    );
  }
}
