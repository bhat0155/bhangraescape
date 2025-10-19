import Link from "next/link";
import { EventSummary } from "../types/events";
import { formatDate } from "../lib/format";

type EventCardProps = {
    event: EventSummary,
    metaText?: string
}

export default function EventCard({event, metaText}: EventCardProps) {
    return(
         <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                <div className="card-body p-4">
                                    
                                    <h3 className="card-title text-xl font-bold leading-tight break-words">
                                        {event.title}
                                    </h3>
                                    
                                    <p className="text-sm opacity-80 mt-1 mb-1">
                                        <span className="font-semibold text-primary">
                                            {formatDate(event.date)}
                                        </span> 
                                    </p>
                                    
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-6.5 12.5-7.5 12.5s-7.5-5.358-7.5-12.5S9.75 3 12 3s7.5 2.358 7.5 7.5Z" />
                                        </svg>
                                        {event.location}
                                    </p>
                                    
                                    <div className="card-actions justify-end mt-4">
                                        <Link 
                                            href={`/events/${event.id}`}
                                            className="btn btn-sm btn-outline btn-primary text-black hover:bg-primary hover:text-base-100"                                        >
                                            View Details
                                        </Link>
                                    </div>
                                    {metaText &&  <p className="text-sm opacity-80">{metaText}</p>}
                                </div>
                            </div>
    )
}