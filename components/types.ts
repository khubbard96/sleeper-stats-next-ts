
export type League = {
    year: number
    numTeams:number
    teams: {
        teamName: string
        rosterId: number
        scores: {
            score: number,
            matchup: number,
            roster: number,
            week: number
        }[]
    }[],

}

export type TeamData = {
    teamId: number,
    year: number,

    wins: number,
    losses: number,
    //interesting data points
    scoreAverage: number,
    scoreStdDev: number,
    consistencyRating: number,
    teamWae: number,
    opponentLuck: number,
    expectedRecord:string,
    sos:number
}