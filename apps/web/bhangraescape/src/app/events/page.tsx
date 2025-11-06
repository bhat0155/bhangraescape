import EventCard from "../components/EventCard";
import { auth } from "@/app/api/auth/[...nextauth]/route"; 
import CreateButtonInline from "../components/CreateButtonInline";



type EventSummary = {
    id: string;
    title: string;
    location: string;
    date: string // stored as an ISO date string (like "2025-10-17T12:00:00Z")
}

type EventListResponse = {
    items: EventSummary[]; 
}

function formatDateTime(iso: string){
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-CA", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(d)
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}){    
    const sp = await searchParams;
    const search =  sp?.search || null;
    const status = sp?.status || null;

    const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
    // building the query params
    const queryParams = new URLSearchParams();
    if(search) queryParams.set("search", search);
    if(status) queryParams.set("status", status);

    // combine base url and query params
    const url = `${base}/events${queryParams.toString() ? `?${queryParams}` : ""}`;

    // variables for data and error
    let data: EventListResponse | null = null;
    let error: string | null = null;

    // role
    const session = await auth();
    const role = (session?.user as any)?.role ?? "GUEST"

    // fetch from backend
    try{
        const res = await fetch(url, {cache: "no-store"});
        if(!res.ok){
            throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
        }
        // parse the json into data variable
        data = await res.json() as EventListResponse;
        console.log({data})
    }catch(err){
        error = err instanceof Error ? err.message : String(err);
    }

    // Get the array of events to render, safely defaulting to an empty array if data is null
    // This correctly extracts the array from the 'items' key
    const eventsToRender = data?.items || [];


    // render the page
    return(
        // ADDED: Main container with responsive padding and spacing
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">

            
            {/* Header with title and optional search form */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  {/* Left: title */}
  <h1 className="text-4xl font-extrabold text-primary">Events</h1>

  {/* Middle: create button */}
  <div className="flex justify-center sm:justify-center">
    <CreateButtonInline role={role} />
  </div>

  {/* Right: search form */}
  <form
    className="flex gap-2 max-w-sm w-full sm:w-auto"
    action="/events"
    method="get"
  >
    <input
      name="search"
      defaultValue={search ?? ""}
      placeholder="Search the event..."
      className="input input-bordered w-full"
    />
    <button type="submit" className="btn btn-primary py-4 px-2 bg-indigo-600 hover:bg-indigo-700 text-white">
      Search
    </button>
  </form>
</header>

            {/* error handling */}
            {error && (
                // ADDED: DaisyUI alert style for errors
                <div role="alert" className="alert alert-error shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span><strong>Failed to load events:</strong> {error}</span>
                </div>
            )}

            {/* main content area */}
            {!error && eventsToRender.length == 0 ? (
                <div className="text-center py-20 bg-base-100 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-semibold opacity-90">No Events Found</h2>
                    <p className="opacity-70 mt-2">Try clearing the search query to see all available events.</p>
                </div>

            ): (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {eventsToRender.map((item)=>{
                        return(
                            <EventCard key={item.id} event={item}/>
                        )
                    })}
                </div>
            )}
        </div>
    )
}