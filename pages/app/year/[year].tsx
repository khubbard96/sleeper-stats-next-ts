import { useRouter } from "next/router";
import { MongoClient } from "mongodb";
import "bootstrap/dist/css/bootstrap.css";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import {
  processDataIntoLeague,
  processTeamData,
} from "../../../components/util";
import { League, TeamData } from "../../../components/types";
import WeeklyScoresTable from "../../../components/WeeklyScoresTable";
import Layout from "../../../components/Layout";
import SeasonSummaryStatsTable, {
  getTable,
} from "../../../components/SeasonSummaryStatsTable";

export default function Year({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { year } = router.query;

  const league: League = data.league;
  const teamData = data.teamData.map(
    (td, idx) => {
      return { ...td, teamName: league.teams.find(team=>team.rosterId== td.teamId)?.teamName};
    }
  );

  let TheTable = getTable<typeof teamData[0]>();

  return (
    <Layout>
      {/*      <WeeklyScoresTable league={league} teamData={teamData} /> */}

      <TheTable.Table data={teamData} rowHeader={"teamName"} tableTitle={"Teams"}>
        <TheTable.Header>
          <TheTable.HeaderCell key="wins">Wins</TheTable.HeaderCell>
          <TheTable.HeaderCell key="losses">Losses</TheTable.HeaderCell>
          <TheTable.HeaderCell key="scoreAverage">
            Score avg
          </TheTable.HeaderCell>
          <TheTable.HeaderCell key="consistencyRating">
            Consis.
          </TheTable.HeaderCell>
          <TheTable.HeaderCell key="teamWae">WAE</TheTable.HeaderCell>
          <TheTable.HeaderCell key="opponentLuck">OppLuck</TheTable.HeaderCell>
          <TheTable.HeaderCell key="expectedRecord">xRec</TheTable.HeaderCell>
          <TheTable.HeaderCell key="sos">S O S</TheTable.HeaderCell>
        </TheTable.Header>
      </TheTable.Table>
    </Layout>
  );
}

/*export async function getServerSideProps({ params }) {
  //console.log(params);
  //process params
  const year = parseInt(params.year);
  const mongoUrl = process.env.MONGO_URL || "localhost";
  const mongoPort = process.env.MONGO_PORT || "27017";
  const url = `mongodb://${mongoUrl}:${mongoPort}`;
  const client = new MongoClient(url);
  const dbName = "sleeper";

  await client.connect();
  console.log("client connected");
  const db = client.db(dbName);
  const leagueCollection = db.collection("league_info");
  const weeksCollection = db.collection("weeks");

  const leagueData = await leagueCollection.find({ year }).toArray();
  const scoresData = await weeksCollection.find({ year }).toArray();

  return {
    props: {
      leagueInfoData: JSON.stringify(leagueData),
      scoresData: JSON.stringify(scoresData),
    },
  };
}*/

type Data = {
  league: League;
  teamData: TeamData[];
};

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context
) => {
  let year = 0;
  if (context.params?.year) {
    const yearRaw = context.params.year;
    if (Array.isArray(yearRaw)) {
      year = parseInt(yearRaw[0]);
    } else {
      year = parseInt(yearRaw);
    }
  }

  const mongoUrl = process.env.MONGO_URL || "localhost";
  const mongoPort = process.env.MONGO_PORT || "27017";
  const url = `mongodb://${mongoUrl}:${mongoPort}`;
  const client = new MongoClient(url);
  const dbName = "sleeper";
  await client.connect();
  console.log("client connected");
  const db = client.db(dbName);
  const leagueCollection = db.collection("league_info");
  const weeksCollection = db.collection("weeks");

  const leagueData = await leagueCollection.find({ year }).toArray();
  const scoresData = await weeksCollection.find({ year }).toArray();

  const league: League = processDataIntoLeague({
    year,
    teamsData: leagueData[0].teams,
    weeksData: scoresData,
  });

  const teamData: TeamData[] = processTeamData({
    year,
    teamsData: leagueData[0].teams,
    weeksData: scoresData,
  });

  const data: Data = {
    league,
    teamData,
  };
  return {
    props: {
      data,
    },
  };
};
