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
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary">Upcoming Events</h1>
                    <p className="text-lg opacity-80 mt-1">Browse all events hosted by the team.</p>
                </div>

                {/* Search form that uses get */}
                {/* MODIFIED: Layout to place input and button side-by-side */}
                <form 
                    className="flex gap-2 max-w-sm w-full" 
                    action="/events" 
                    method="get"
                >
                    <input
                        name="search"
                        defaultValue={search ?? ""}
                        placeholder="Search title or location"
                        // ADDED: DaisyUI input style
                        className="input input-bordered w-full"
                    />
                    <button type="submit" className="btn btn-primary">
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
                            <div key= {item.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                <div className="card-body p-4">
                                    
                                    <h3 className="card-title text-xl font-bold leading-tight break-words">
                                        {item.title}
                                    </h3>
                                    
                                    <p className="text-sm opacity-80 mt-1 mb-1">
                                        <span className="font-semibold text-primary">
                                            {formatDateTime(item.date)}
                                        </span> 
                                    </p>
                                    
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-6.5 12.5-7.5 12.5s-7.5-5.358-7.5-12.5S9.75 3 12 3s7.5 2.358 7.5 7.5Z" />
                                        </svg>
                                        {item.location}
                                    </p>
                                    
                                    <div className="card-actions justify-end mt-4">
                                        <a 
                                            href={`/events/${item.id}`}
                                            className="btn btn-sm btn-outline btn-primary text-black hover:bg-primary hover:text-base-100"                                        >
                                            View Details
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
