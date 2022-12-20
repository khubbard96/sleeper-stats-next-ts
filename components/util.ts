import { inspect } from "node:util";
import { League, TeamData } from "./types";
const ztable = require("ztable");

export const processDataIntoLeague = (args: {
  year: number;
  teamsData: any[];
  weeksData: any[];
}): League => {
  const asdf = 3;

  //console.log(args.weeksData.map((w)=>w.scores.map((s:any)=>{s.week= w.week;return s})));

  const allScores = args.weeksData
    .map((w) =>
      w.scores.map((s: any) => {
        s.week = w.week;
        return s;
      })
    )
    .reduce((acc: any[], curr, idx) => {
      const n = acc.concat(curr);
      return n;
    }, []);

  const teams = args.teamsData.map((t) => ({
    teamName: t.team_name,
    rosterId: t.roster_id,
    scores: allScores.filter((s) => s.roster == t.roster_id),
  }));

  return {
    year: args.year,
    numTeams: args.teamsData.length,
    teams,

    //getTeamNames
  };
};

export const processTeamData = (args: {
  year: number;
  teamsData: any[];
  weeksData: any[];
}): TeamData[] => {
  const teamData = [] as TeamData[];

  const allScores = args.weeksData
    .map((w) =>
      w.scores.map((s: any) => {
        s.week = w.week;
        return s;
      })
    )
    .reduce((acc: any[], curr, idx) => {
      const n = acc.concat(curr);
      return n;
    }, []);

  args.teamsData.forEach((team) => {
    const teamScores = allScores.filter((sc) => sc.roster === team.roster_id);

    const teamScoreAverage =
      teamScores.reduce((acc, curr, idx) => {
        return acc + curr.score;
      }, 0) / teamScores.length;

    const teamScoreVariance =
      teamScores.reduce((acc, curr, idx) => {
        return acc + Math.pow(curr.score - teamScoreAverage, 2);
      }, 0) / teamScores.length;

    const teamScoreStdDev = Math.sqrt(teamScoreVariance);

    let totalPredictedWins = 0,
      totalPredictedLosses = 0,
      actualWins = 0,
      luckWins = 0;
    teamScores.forEach((thisTeamScore) => {
      allScores
        .filter(
          (allScores) =>
            allScores.roster != thisTeamScore.roster &&
            allScores.week == thisTeamScore.week
        )
        .forEach((otherScore) => {
          if (thisTeamScore.score > otherScore.score) {
            totalPredictedWins++;
          } else {
            totalPredictedLosses++;
          }

          if (thisTeamScore.matchup == otherScore.matchup) {
            if (thisTeamScore.score > otherScore.score) {
              actualWins++;
            }
          }
        });
    });

    const expectedWins =
      (totalPredictedWins / (totalPredictedWins + totalPredictedLosses)) *
      teamScores.length;
    const teamWae = actualWins - expectedWins;

    teamData.push({
      teamId: team.roster_id,
      year: args.year,
      scoreAverage: Math.round(teamScoreAverage * 100) / 100,
      scoreStdDev: Math.round(teamScoreStdDev * 100) / 100,
      consistencyRating: 0,
      teamWae: Math.round(teamWae * 100) / 100,
      wins: actualWins,
      losses: teamScores.length - actualWins,
      opponentLuck: 0,
      expectedRecord: "0-0",
      sos:0
    });
  });

  //calculate strength metrics

  teamData.forEach((team)=>{
    const teamScores = allScores.filter((sc) => sc.roster == team.teamId);
    const teamOpponents:number[] = [];
    let opponentWins = 0, opponentLosses = 0;
    teamScores.forEach((score)=>{
        const week = score.week;
        const matchup = score.matchup;
        const otherScore = allScores.find((s)=>s.week==week && s.matchup==matchup && s.roster != score.roster);
        const otherTeamData = teamData.find((t)=>t.teamId==otherScore.roster);
        if(!teamOpponents.includes(otherTeamData?.teamId || 0)) {
            teamOpponents.push(otherTeamData?.teamId || 0);
            opponentWins += otherTeamData?.wins || 0;
            opponentLosses += otherTeamData?.losses || 0;
        }
    });

    let oppOppWins = 0, oppOppLosses = 0;
    teamOpponents.forEach((oppId)=>{
        const oppData = teamData.find((t)=>t.teamId==oppId);
        const oppTeamScores = allScores.filter((sc)=>sc.roster ==oppData?.teamId);
        const oppOpponents:number[] = [];
        oppTeamScores.forEach((oppTeamScore)=>{
            const week = oppTeamScore.week;
            const matchup = oppTeamScore.matchup;
            const otherScore = allScores.find((s)=>s.week==week && s.matchup==matchup && s.roster != oppTeamScore.roster);
            const otherTeamData = teamData.find((t)=>t.teamId==otherScore.roster);
            if(!oppOpponents.includes(otherTeamData?.teamId || 0)) {
                oppOpponents.push(otherTeamData?.teamId || 0);
                oppOppWins += otherTeamData?.wins || 0;
                oppOppLosses += otherTeamData?.losses || 0;
            }
        })
    })

    //bcs SOS formula
    const sos = ( 2 *(opponentWins / (opponentWins+opponentLosses)) + ( oppOppWins / (oppOppWins+oppOppLosses)) ) /  3
    team.sos = Math.round(sos*10000)/10000;
  })

  //calculate luck stats
  teamData.forEach((team)=>{
    const teamScores = allScores.filter((sc) => sc.roster == team.teamId);
    
    let xWins = 0, xLosses = 0
    let luckWins = 0, luckLosses = 0;
    teamScores.forEach((score)=>{
        const week = score.week;
        const matchup = score.matchup
        const otherScore = allScores.find((s)=>s.week==week && s.matchup==matchup && s.roster != score.roster);
        const otherTeamData = teamData.find((t)=>t.teamId==otherScore.roster);



        if(otherScore.score > score.score) {
            const z = (otherScore.score - (otherTeamData?.scoreAverage || 0)) / (otherTeamData?.scoreStdDev || 0)
            const probOtherTeamWins =  ztable(z); //probability that this team scores less than you
            xLosses+=probOtherTeamWins;
            xWins+=(1-probOtherTeamWins);
        } else {
            const z = (score.score - (team?.scoreAverage || 0)) / (team?.scoreStdDev || 0)
            const probThisTeamWins =  ztable(z); //probability that this team scores less than you
            xWins+=probThisTeamWins;
            xLosses+=(1-probThisTeamWins);
        }
    
        teamData.forEach((otherTeam)=>{
            if(otherTeam.teamId!=team.teamId) {
                const otherTeamAvg = otherTeam.scoreAverage;
                if(score.score>otherTeamAvg) {
                    luckWins++
                } else {
                    luckLosses++;
                }
            }
        })
    })

    const luckWinPct = luckWins / (luckWins+luckLosses);
    const luckWae = team.wins - (luckWinPct * (team.wins+team.losses))

    team.opponentLuck=Math.round(luckWae*100)/100//Math.round(totalLossesDueToOppLuck * 100) / 100;
    team.expectedRecord=""+(Math.round(xWins*100)/100)+"-"+(Math.round(xLosses*100)/100)
  })

  return teamData;
};
