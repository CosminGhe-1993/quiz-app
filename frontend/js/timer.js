// Clasa Timer — encapsuleaza logica de numarare inversa
export class Timer{
    constructor(secunde, onTick, onExpire){
        this.secunde = secunde; // durata in secunde
        this.onTick = onTick; // callback apelat la fiecare secunda cu timpul ramas
        this.onExpire = onExpire; // callback apelat cand timerul expira
        this.interval = null; // referinta la setInterval
    }

    start(){
        let timpRamas = this.secunde;
        this.onTick(timpRamas);

        this.interval = setInterval(() =>{
            timpRamas--;
            this.onTick(timpRamas);

            if(timpRamas <= 0){
                this.stop();
                this.onExpire();
            }
        }, 1000)
    }

    stop(){
        clearInterval(this.interval);
        this.interval = null;
    }
}