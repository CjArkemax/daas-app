
export function playBell(): void{
    try{
        const audio = new Audio('/sounds/giorno_theme.mp3');
        audio.play().catch(()=>{});
    }catch{
        //audio is nice to have
    }
}