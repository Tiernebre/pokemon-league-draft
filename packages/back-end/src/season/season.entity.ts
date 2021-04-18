import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ChallengeEntity } from "../challenge/challenge.entity";
import { DraftEntity } from "../draft/draft.entity";
import { LeagueEntity } from "../leagues/league.entity";

@Entity({
  name: "season",
})
export class SeasonEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: false,
  })
  name!: string;

  @Column({
    nullable: false,
  })
  description!: string;

  @ManyToOne(() => LeagueEntity, (league) => league.seasons)
  league!: Promise<LeagueEntity>;

  @OneToMany(() => ChallengeEntity, (challenge) => challenge.season)
  challenges!: Promise<ChallengeEntity[]>;

  @CreateDateColumn({ nullable: false, update: false })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt!: Date;

  @OneToOne(() => DraftEntity, (draft) => draft.season)
  draft!: Promise<DraftEntity>;
}
