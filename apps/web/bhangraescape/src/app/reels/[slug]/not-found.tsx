import Link from "next/link";

export default function ReelNotFound(){
    return(
        <main className="max-w-2xl mx-auto p-6 text-center space-y-3">
      <h1 className="text-2xl font-bold">Video not found</h1>
      <p className="opacity-75">The link may be incorrect or the video was moved.</p>
      <Link href="/" className="btn btn-primary mt-2 text-white">Back to Home</Link>
    </main>
 
    )
}