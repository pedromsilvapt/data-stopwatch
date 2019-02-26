var SECOND_IN_NANOS = 1000 * 1000 * 1000;

export enum StopwatchState{
    Paused = 0,
    Running = 1
}

export class Stopwatch {
    protected static sumTimes ( [ sa, ma ] : [ number, number ], [ sb, mb ] : [ number, number ] ) : [ number, number ] {
        const m = ma + mb;

        return [ sa + sb + Math.floor( m / SECOND_IN_NANOS ), ( m % SECOND_IN_NANOS ) ];
    }

    protected static subTimes ( [ sa, ma ] : [ number, number ], [ sb, mb ] : [ number, number ] ) : [ number, number ] {
        let m = ma - mb;

        let overflow = 0;

        if ( m < 0 ) {
            m = Math.abs( m );

            overflow = 1 + Math.floor( Math.abs( m ) / SECOND_IN_NANOS );
            m = SECOND_IN_NANOS - ( m % SECOND_IN_NANOS );
        }

        return [ sa - sb - overflow, m ];
    }

    static hrtime ( time ?: [ number, number ] ) : [ number, number ] {
        return process.hrtime( time );
    }

    protected startTime : [ number, number ] = null;

    protected bankedTime : [ number, number ] = [ 0, 0 ];

    protected marks : Map<string, [ number, number ]> = new Map();

    state  : StopwatchState = StopwatchState.Paused;

    constructor ( paused : boolean = false ) {
        if ( !paused ) {
            this.resume();
        }
    }

    get paused () : boolean {
        return this.state === StopwatchState.Paused;
    }

    get running () : boolean {
        return this.state === StopwatchState.Running;
    }

    mark ( name : string, subtractFrom ?: string ) : this {
        if ( subtractFrom ) {
            const markTime = this.marks.get( subtractFrom );

            this.marks.set( name, Stopwatch.subTimes( this.read(), markTime ) );
        } else {
            this.marks.set( name, this.read() );
        }
        
        return this;
    }

    pause () : this {
        if ( this.state === StopwatchState.Running ) {
            this.state = StopwatchState.Paused;

            this.bankedTime = Stopwatch.sumTimes( this.bankedTime, Stopwatch.hrtime( this.startTime ) );

            this.startTime = null;
        }

        return this;
    }

    resume () : this {
        if ( this.state === StopwatchState.Paused ) {
            this.state = StopwatchState.Running;
            
            this.startTime = Stopwatch.hrtime();
        }

        return this;
    }

    read ( mark ?: string ) : [ number, number ] {
        if ( mark != null ) {
            const markTime = this.marks.get( mark );

            if ( !markTime ) {
                throw new Error( `No stopwatch mark named ${ mark }.` );
            }

            return markTime;
        }

        if ( this.paused ) {
            return this.bankedTime;
        }

        const time = Stopwatch.hrtime( this.startTime );

        return Stopwatch.sumTimes( this.bankedTime, time );
    }

    readMilliseconds ( mark ?: string ) : number {
        const [ seconds, nano ] = this.read( mark );

        return seconds * 1000 + ( nano / 1000000 );
    }

    readHumanized ( mark ?: string ) : string {
        const milliseconds = this.readMilliseconds( mark );

        if ( milliseconds < 1000 ) {
            return milliseconds.toFixed( 3 ) + 'ms';
        } else if ( milliseconds < 1000 * 60 ) {
            return ( milliseconds / 1000 ).toFixed( 2 ) + 's';
        } else {
            return ( milliseconds / 1000 / 60 ).toFixed( 2 ) + 'min';
        }
    }
}
