import EventForm from "@/components/shared/EventForm"
import { auth } from "@clerk/nextjs/server";
import React from "react";



const CreateEvent = async () => {
  const { sessionClaims } = await auth();

  
  const userId = sessionClaims?.userId as string;

  console.log(userId)

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
export default CreateEvent






// import EventForm from "@/components/shared/EventForm";
// import { useAuth } from "@clerk/nextjs";  // Use useAuth hook

// const CreateEvent = () => {
//   const { userId } = useAuth();  // Get the userId from the hook

//   return (
//     <>
//       <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
//         <h3 className="wrapper h3-bold text-center sm:text-left">Create Event</h3>
//       </section>

//       <div className="wrapper my-8">
//         <EventForm userId={userId as string} type="Create" />  {/* Pass userId to the form */}
//       </div>
//     </>
//   )
// }

// export default CreateEvent;
