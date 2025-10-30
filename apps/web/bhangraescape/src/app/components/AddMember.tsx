"use client"
import { useState } from "react"
import AddMemberModal from "./AddMemberModal"

export default function AddMember({isAdmin}: {isAdmin: boolean}){
    const [open, isOpen]=useState(false)
    function onClose(){
        isOpen(false)
    }
    return(
        <div>
           <button
           type="button"
            disabled={!isAdmin}
            className={`btn btn-primary btn-sm ${!isAdmin ? "btn-disabled opacity-70 cursor-not-allowed" : ""}`}
           onClick={()=> isOpen((prev)=> !prev)}
           title="create member"
           >
            Add Member
           </button>
           {
            open &&  <AddMemberModal onClose={onClose}/>
            
           }
        </div>
    )
}