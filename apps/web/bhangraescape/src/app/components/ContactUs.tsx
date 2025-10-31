"use client"

import { useState } from "react"

export default function ContactUsForm(){
    const [name, setName]= useState<string|null>(null);
    const [email, setEmail] = useState<string|null>(null);
    const [message, setMessage]=useState<string|null>(null);
    const [sending, setSending]=useState(false);
    const [error, setError]=useState<string|null>(null);
    const [success, setSuccess]= useState<string|null>(null);

    function isValidName(input: string){
        return !!input && input.trim().length > 3;
    }

      function isValidEmail(input: string){
        if(!input) return false;
        const s = input.trim();
         return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
    }

      function isValidMessage(input: string){
        return !!input && input.trim().length > 3;
    }

    const buttonActive = isValidName(name ?? "") && isValidEmail(email ?? "") && isValidMessage(message ?? "");

   async function handleSubmit(){
        setError(null)
        if(!name?.trim() || !email?.trim() || !message?.trim()){
            setError(`Please fill all required fields`);
            return;
        }
        const body: Record<string, string>={}
        body.name=name.trim();
         body.email=email.trim();
          body.message=message.trim();

        setSending(true)
        try{
            const res = await fetch(`/api/contactus`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            })

            if(!res.ok){
                const text = await res.text().catch(()=>"")
                throw new Error(`Could not send the message: ${text}`)
            }

            setEmail("")
            setName("")
            setError("")

            setSuccess("Message successfully sent to team")

           setTimeout(() => {
            setSuccess(null)
           }, 3000);

        }catch(err){
            console.log(err)
            setError(`Could not send the message: ${err?.message}`)
        }finally{
            setSending(false)
        }
    }
        return(
           <div>
                <label htmlFor="name"> Name: </label>
                <input
               onChange={(ev)=> setName(ev.target.value)}
               disabled={sending}
               value={name ?? ""}
                ></input>

                {/* email */}
                 <label htmlFor="email"> Email: </label>
                <input
               onChange={(ev)=> setEmail(ev.target.value)}
               disabled={sending}
               value={email ?? ""}
                ></input>

                {/* message */}
                 <label htmlFor="message"> message: </label>
                <input
               onChange={(ev)=> setMessage(ev.target.value)}
               disabled={sending}
               value={message ?? ""}
                ></input>

                {/* button */}
                <button
                onClick={handleSubmit}
                disabled={!buttonActive}
                >Send</button>

                {error && <div>{error}</div>}
                {success && <div>{success}</div>}
           </div>
        )
}