import React, { useState } from "react";
import { League, TeamData } from "./types";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyScoresTable: React.FC<{ league: League, teamData: TeamData[] }> = ({ league, teamData }) => {
  const [teamDetailedViewing, setTeamDetailedViewing] = useState(0);

  const getTableHeaderRow = () => {
    return (
      <tr>
        <th scope="col">Team</th>
        {Array.from(Array(league.teams[0].scores.length).keys()).map((wk) => {
          return <th scope="col">{wk + 1}</th>;
        })}
        <th scope="col">Actual record</th>
      </tr>
    );
  };

  const getTableRowForTeam = (team: {
    teamName: string;
    rosterId: number;
    scores: {
      score: number;
      matchup: number;
      roster: number;
      week: number;
    }[];
  }) => {
    let wins = 0,
      losses = 0;

    return (
      <>
        <tr>
          <th scope="row">
            {team.teamName}
            <button
              onClick={() =>
                setTeamDetailedViewing(
                  teamDetailedViewing == team.rosterId ? 0 : team.rosterId
                )
              }
            >
              more
            </button>
          </th>
          {team.scores.map((score) => {
            const otherScore = league.teams
              .filter((t) => t.rosterId != team.rosterId)
              .map((t) => t.scores)
              .flat()
              .filter(
                (s) => s.matchup == score.matchup && s.week == score.week
              )[0].score;
            score.score > otherScore ? wins++ : losses++;
            return <td>{score.score}</td>;
          })}
          <td>
            {wins}-{losses}
          </td>
        </tr>{" "}
        {team.rosterId == teamDetailedViewing && getDetailsViewForTeam(team)}
      </>
    );
  };

  const getDetailsViewForTeam = (team: {
    teamName: string;
    rosterId: number;
    scores: {
      score: number;
      matchup: number;
      roster: number;
      week: number;
    }[];
  }) => {
    const teamScoreAverage = teamData.find((t)=>t.teamId==team.rosterId)?.scoreAverage || 0

    const teamScoreStdDev = teamData.find((t)=>t.teamId==team.rosterId)?.scoreStdDev || 0;

    const teamWae = teamData.find((t)=>t.teamId==team.rosterId)?.teamWae || 0

    const teamOppLuck = teamData.find((t)=>t.teamId==team.rosterId)?.opponentLuck || 0

    const xRec = teamData.find((t)=>t.teamId==team.rosterId)?.expectedRecord || ""


    return (
      <>
        <td>
            <h6>Average: {Math.round(teamScoreAverage*100)/100}</h6>
            <h6>StdDev: {Math.round(teamScoreStdDev * 100) / 100}</h6>
            <h6>Consistency rating: {Math.round(teamScoreAverage / Math.pow(teamScoreStdDev,2) * 1000) / 1000}</h6>
            <h6>WAE: {teamWae}</h6>
            <h6>OppLuck: {teamOppLuck}</h6>
            <h6>xRec: {xRec}</h6>

        </td>
        <td colSpan={team.scores.length} style={{ maxHeight: "250px" }}>
          <Line
            options={{
              maintainAspectRatio: false,
              responsive: true,
              scales: {
                y: {
                  alignToPixels: true,
                },
              },
              plugins: {
                legend: {
                  display: false,
                  position: "left" as const,
                },
                title: {
                  display: false,
                  text: "Chart.js Line Chart",
                },
              },
            }}
            data={{
              labels: Array.from(
                Array(league.teams[0].scores.length).keys()
              ).map((k) => "Wk " + (k + 1)),
              datasets: [
                {
                  label: "Score",
                  data: team.scores.map((sc) => sc.score),
                  borderColor: "rgb(53, 162, 235)",
                  backgroundColor: "rgba(53, 162, 235, 0.5)",
                },
                {
                    label:"Season average",
                    data: Array(team.scores.length).fill(teamScoreAverage),
                    borderColor: "rgba(0, 0, 0, 0.5)",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    borderDash:[10,10]
                },
                {
                    label: "Upper StdDev",
                    data: Array(team.scores.length).fill(teamScoreAverage + teamScoreStdDev),
                    borderColor: "rgba(0, 0, 0, 0.25)",
                    backgroundColor: "rgba(0, 0, 0, 0.25)",
                    borderDash:[30,30]
                },
                {
                    label: "Lower StdDev",
                    data: Array(team.scores.length).fill(teamScoreAverage - teamScoreStdDev),
                    borderColor: "rgba(0, 0, 0, 0.25)",
                    backgroundColor: "rgba(0, 0, 0, 0.25)",
                    borderDash:[30,30]
                },
                {
                    label: "League sznavg",
                    data: Array(team.scores.length).fill(teamData.map(t=>t.scoreAverage).reduce((acc,curr,idx)=>acc+curr,0)/10),
                    borderColor: "rgba(255, 0, 0, 0.25)",
                    backgroundColor: "rgba(255, 0, 0, 0.25)",
                    borderDash:[5,5]
                }
              ],
            }}
          ></Line>
        </td>
      </>
    );
  };

  return (
    <div>
      <table className="table table-striped table-bordered">
        <thead>{getTableHeaderRow()}</thead>
        <tbody>
          {league.teams.map((team) => {
            return getTableRowForTeam(team);
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyScoresTable;
