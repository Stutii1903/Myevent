import EventForm from "@/components/shared/EventForm"
// import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import { auth } from "@clerk/nextjs/server";

// const CreateEvent = async () => {
//   try {
//     // Use currentUser() instead of auth() to avoid headers() issues
//     const clerkUser = await currentUser();
    
//     if (!clerkUser) {
//       return (
//         <div className="wrapper my-8">
//           <p>Please sign in to create an event.</p>
//         </div>
//       );
//     }

//     // Get the MongoDB userId from Clerk's publicMetadata
//     const userId = clerkUser.publicMetadata?.userId as string;
    
//     console.log('Clerk User ID:', clerkUser.id);
//     console.log('MongoDB User ID:', userId);
    
//     if (!userId) {
//       console.error('No userId found in session claims');
//       return (
//         <div className="wrapper my-8">
//           <p>Please sign in to create an event.</p>
//         </div>
//       );
//     }
const CreateEvent = async () => {
  const { userId } = await auth(); // Use userId directly, not sessionClaims
  
  console.log('Create Event Page - User ID:', userId);

  if (!userId) {
    return (
      <div className="wrapper my-8">
        <p>Please sign in to create an event.</p>
      </div>
    );
  }

    return (
      <>
        <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
          <h3 className="wrapper h3-bold text-center sm:text-left">Create Event</h3>
        </section>
        <div className="wrapper my-8">
          <EventForm userId={userId} type="Create" />
        </div>
      </>
    )
  } 

export default CreateEvent;

