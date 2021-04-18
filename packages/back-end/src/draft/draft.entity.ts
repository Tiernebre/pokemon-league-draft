import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChallengeEntity } from "../challenge/challenge.entity";
import { DraftPokemonEntity } from "./draft-pokemon.entity";

@Entity({
  name: "draft",
})
export class DraftEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => ChallengeEntity, (challenge) => challenge.draft)
  challenge!: Promise<ChallengeEntity>;

  @OneToMany(() => DraftPokemonEntity, (draftPokemon) => draftPokemon.draft)
  pokemon!: Promise<DraftPokemonEntity[]>;
}
