// import { NextResponse } from "next/server";
// import { currentUser } from "@clerk/nextjs/server";
// import { connectToDatabase } from "@/lib/database";
// import User from "@/lib/database/models/user.model";
// import { clerkClient } from "@clerk/nextjs/server";

// export async function POST() {
//   try {
//     // Get current Clerk user
//     const clerkUser = await currentUser();
    
//     if (!clerkUser) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

//     console.log("Syncing user:", clerkUser.id);
//     console.log("User data:", {
//       id: clerkUser.id,
//       email: clerkUser.emailAddresses[0]?.emailAddress,
//       firstName: clerkUser.firstName,
//       lastName: clerkUser.lastName
//     });

//     await connectToDatabase();

//     // Check if user already exists in MongoDB
//     const existingUser = await User.findOne({ clerkId: clerkUser.id });
    
//     if (existingUser) {
//       return NextResponse.json({
//         success: true,
//         message: "User already exists",
//         user: existingUser
//       });
//     }

//     // Create new MongoDB user
//     const userData = {
//       clerkId: clerkUser.id,
//       email: clerkUser.emailAddresses[0]?.emailAddress || '',
//       username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || '',
//       firstName: clerkUser.firstName || '',
//       lastName: clerkUser.lastName || '',
//       photo: clerkUser.imageUrl || '',
//     };

//     console.log("Creating MongoDB user with data:", userData);
    
//     const newUser = await User.create(userData);
    
//     console.log("MongoDB user created:", newUser._id);

//     // Update Clerk metadata with MongoDB user ID
//     await clerkClient.users.updateUserMetadata(clerkUser.id, {
//       publicMetadata: {
//         userId: newUser._id.toString()
//       }
//     });

//     console.log("Updated Clerk metadata");

//     return NextResponse.json({
//       success: true,
//       message: "User synced successfully",
//       user: newUser,
//       clerkId: clerkUser.id,
//       mongoId: newUser._id
//     });

//   } catch (error) {
//     console.error("Error syncing user:", error);
//     return NextResponse.json({
//       success: false,
//       error: error.message
//     }, { status: 500 });
//   }
// }