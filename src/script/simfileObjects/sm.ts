import {ChartDifficulty} from "./generic.ts";

export interface BPMs {
    beat: number;
    bpm: number;
}

export interface Stops {
    beat: number;
    seconds: number;
}

interface DynamicDispBPM {
    from: number;
    to: number;
}

interface Measure {
    measure: Array<number>
}

// Not included tags will be ignored
interface SMHeaderTags {
    title: string;
    subtitle: string;
    artist: string;
    genre: string;
    credit: string;

    banner: string; // file path
    background: string; // file path
    cdtitle: string; // file path
    displaybpm: number | DynamicDispBPM; // asterisk as -1

    samplestart: number;
    samplelength: number;

    music: string; // file path
    offset: number;
    bpms: Array<BPMs> | undefined;
    stops: Array<Stops> | undefined;
}

export interface SMChartTags {
    chartType: string; // only supports dance-single atm
    chartAuthor: string;
    difficulty: ChartDifficulty;
    numDifficulty: number; // numerical difficulty
    grooveRadar: unknown; // not supported atm
    notes: Array<Measure>
}

// Fully composed .sm chart object

export default interface ChartSM {
    header: SMHeaderTags;
    charts: Array<SMChartTags>;
}

export const templateChart: ChartSM = {
    header: {
        title: "",
        subtitle: "",
        artist: "",
        genre: "",
        credit: "",
        banner: "",
        background: "",
        cdtitle: "",
        displaybpm: 0,
        samplestart: 0,
        samplelength: 0,
        music: "",
        offset: 0,
        bpms: undefined,
        stops: undefined
    },
    charts: []
}