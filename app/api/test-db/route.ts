import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import Category from "@/lib/database/models/category.model";
import Event from "@/lib/database/models/event.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    const eventCount = await Event.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      counts: {
        users: userCount,
        categories: categoryCount,
        events: eventCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
