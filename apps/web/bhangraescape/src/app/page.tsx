import AuthButtons from "./components/authButtons";

export default function home(){
    return(
      <div className="min-h-screen p-8">
        <main className="flex flex-col gap-6">
        Hiiii, welcome to BhangraScape!
         <button className="btn btn-primary">Primary Button</button>
      <div className="alert alert-info">
        <span>DaisyUI is working 🎉</span>
      </div>
        </main>
      </div>
    )
}