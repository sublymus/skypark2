 import EventEmiter from '/ts_lib/event/eventEmiter.js'
class Anim  extends  EventEmiter{
    
    #accu = 0;
    #curentRun;
    #runnig = false;
    #status;
    #duration;
    #endRequire;
    #cursor;
    #loop;
    constructor(params) {
        super()
        if (!(params instanceof Object)) {
            params = {};
        }
        this.params = params;
        //this.data = params.data;
        this.rest();
        this.#progress();
        this.#updateStatus("onStart");
    }
    rest() {
        this.defautCursor = p => p;
        this.rsc = this.params.rsc;
        this.duration = this.params.duration;
        this.endRequire = this.params.endRequire;
        this.cursor = this.params.cursor;
        this.loop = this.params.loop;
    }
    get status() {
        return this.#status;
    }
    get duration() {
        return this.#duration;
    }
    set duration(v) {
        this.#duration = v ?? 1000;
    }
    get endRequire() {
        return this.#endRequire;
    }
    set endRequire(v) {
        this.#endRequire = v ?? true;
    }
    get cursor() {
        this.#cursor
    }
    set cursor(v) {
        this.#cursor = v instanceof Function ? (v(this.#accu / this.duration) instanceof Number ? v : this.defautCursor) : this.defautCursor;
    }
    get loop() {
        return this.#loop;
    }
    set loop(v) {
        if (v != undefined) {
            let valideLoop = v.methode.startsWith("start") ||
                v.methode.startsWith("startReverse") ||
                v.methode.startsWith("toogle");
            if (!valideLoop) throw new Error("the loop methode <" + v.methode + "> is not find");
            this.#loop = {}
            this.#loop.methode = v.methode;
            this.#loop.maxCycleCount = v.maxCycleCount instanceof Number ? v.maxCycleCount : undefined;
            if (v.maxCycleCount == undefined) {
                this.#loop.duration = v.duration instanceof Number ? v.duration : Infinity;
            }
            this.#loop.count = 0;
            this.#loop.exec = () => {
                if (this.#loop.maxCycleCount != undefined) {
                    this.#loop.count++;
                    if (this.#loop.count >= this.#loop.maxCycleCount) {
                        return;
                    }
                    this[this.#loop.methode];
                }

            }
        }
    }

    #updateStatus(event) {
        if (event != this.#status) {
            this.#status = event;
            this.emit(event ,this);
            this.emit("change" ,this);
        }
    }
    #progress() {
        //console.log('progress');
        this.emit("progress" ,this.#accu / this.duration);
    }
    

    start() {
        if (this.endRequire && this.#runnig) {
            return;
        }
        this.#accu = 0;
        this.#progress();
        this.#updateStatus("onStart");
        this.#updateStatus("start");
        this.#updateStatus("normal");
        this.run();
    }

    startReverse() {
        if (this.endRequire && this.#runnig) {
            return;
        }
        this.#accu = this.duration;
        this.#progress();
        this.#updateStatus("onEnd");
        this.#updateStatus("startReverse");
        this.#updateStatus("reverse");
        this.run();
    }

    toggle() {
        if (this.endRequire && this.#runnig) {
            return;
        }
        if (this.#runnig) {
            if (this.status == "normal") {
                this.#updateStatus("reverse");
            } else if (this.status == "reverse") {
                this.#updateStatus("normal");
            }
        } else {
            if (this.status == "onStart") {
                this.start();
            } else if (this.status == "onEnd") {
                this.startReverse();
            }
        }
    }

    run() {
        if (this.#curentRun != undefined) {
            this.#curentRun.stop();
        }
        let lastTime = 0;
        let newStatus;
        this.#runnig = true;
        let begin = true;
        const data = {
            stop: () => {
                this.#runnig = false;
                data.stopAction = true;
            },
            stopAction: false
        }
        this.#curentRun = data
        const anim = (time) => {
            if (begin) {
                begin = false;
                lastTime = time;
            }
            const interval = time - lastTime;
            lastTime = time;

            if (this.status == "normal") {
                this.#accu += interval;
            } else if (this.status == "reverse") {
                this.#accu -= interval;
            } else {
                throw new Error(" Error in running < this.status = normal || reverse >")
            }

            if (this.#accu > this.duration) {
                this.#accu = this.duration;
                newStatus = "onEnd";
                this.#runnig = false;
            }
            if (this.#accu < 0) {
                this.#accu = 0;
                newStatus = "onStart";
                this.#runnig = false;
            }

            this.#progress();

            if (data.stopAction) return;

            if (this.#runnig) {
                requestAnimationFrame(anim);
            } else {
                this.#updateStatus(newStatus);
            }
        };
        requestAnimationFrame(anim);
    }
}

export default Anim