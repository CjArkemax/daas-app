
export function playBell(): void{
    try{
        const audio = new Audio('/sounds/yes-yes-yes-yes-yes.mp3');
        audio.play().catch(()=>{});
    }catch{
        //audio is nice to have
    }
}