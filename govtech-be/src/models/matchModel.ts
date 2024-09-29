export interface Match {
  id?: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
}

export interface TeamStat {
  id?: string;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
}
