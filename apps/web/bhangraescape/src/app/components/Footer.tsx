export default function Footer(){
    return (
        <div>
            <footer className="border-t bg-base-100">
                      <div className="container mx-auto w-full max-w-6xl p-4 md:p-6 text-sm flex flex-col md:flex-row items-center justify-between gap-2">
                        <p>{new Date().getFullYear()} BhangraScape</p>
                        <p className="opacity 70">
                            Made with ❤️ by the Ekam.
                        </p>
                      </div>

            </footer>
        </div>
    )
}