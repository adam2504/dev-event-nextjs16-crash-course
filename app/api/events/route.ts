import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const fromData = await req.formData();

        let event;
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Event reatio Failed', error: e ? instanceof Error ? e.message : 'Unknown' })
    }
}