import { fetchOk } from "../http";
import { HttpClient } from "../http/http-client";
import {
  NamedAPIResourceList,
  PokeApiPokedex,
  PokeApiVersion,
  PokeApiVersionGroup,
} from "../poke-api";
import { VersionService } from "./version.service";
import {
  mapPokedexFromPokeApi,
  mapVersionFromEntity,
  mapVersionFromPokeApi,
  mapVersionGroupFromPokeApi,
} from "./version.mapper";
import { Version } from "./version";
import { Pokedex } from "./pokedex";
import { Repository } from "typeorm";
import { VersionDeniedPokemonEntity } from "./version-denied-pokemon.entity";
import { Logger } from "../logger";
import { VersionEntity } from "./pokemon-version.entity";

export class PokeApiVersionService implements VersionService {
  constructor(
    private readonly pokeApiHttpClient: HttpClient,
    private readonly versionDeniedPokemonRepository: Repository<VersionDeniedPokemonEntity>,
    private readonly logger: Logger,
    private readonly versionRepository: Repository<VersionEntity>
  ) {}

  async getOneById(id: number): Promise<Version> {
    this.logger.info(`Retrieving version with id = ${id}`);
    const foundVersion = await this.pokeApiHttpClient.get<PokeApiVersion>(
      `version/${id}`
    );
    const deniedPokemon = await this.versionDeniedPokemonRepository.find({
      versionId: foundVersion.id,
    });
    const deniedPokemonIds = deniedPokemon.map(({ pokemonId }) => pokemonId);
    this.logger.info(
      `Retrieved version with id = ${id} and name = ${foundVersion.name}`
    );
    return mapVersionFromPokeApi(foundVersion, deniedPokemonIds);
  }

  async getPokedexFromOneWithId(id: number): Promise<Pokedex> {
    return this.getPokedexFromOne(await this.getOneById(id));
  }

  async getPokedexFromOne(version: Version): Promise<Pokedex> {
    this.logger.info(
      `Retrieving regional pokedex for given version = ${JSON.stringify(
        version
      )}`
    );
    const versionGroupResponse = await fetchOk<PokeApiVersionGroup>(
      version.versionGroupUrl
    );
    const versionGroup = mapVersionGroupFromPokeApi(versionGroupResponse);
    const pokedexResponse = await fetchOk<PokeApiPokedex>(
      versionGroup.pokedexUrl
    );
    return mapPokedexFromPokeApi(pokedexResponse);
  }

  async getAll(): Promise<Version[]> {
    if ((await this.versionRepository.count()) <= 0) {
      await this.cacheAllFromPokeApi();
    }

    return (await this.versionRepository.find()).map((version) =>
      mapVersionFromEntity(version)
    );
  }

  async cacheAllFromPokeApi(): Promise<void> {
    const { results } = await this.pokeApiHttpClient.get<NamedAPIResourceList>(
      "version?limit=100"
    );
    const versions = await Promise.all(
      results.map(async (result) => {
        return fetchOk<PokeApiVersion>(result.url);
      })
    );
    const versionsToSave = versions.map((version) => {
      return this.versionRepository.create({
        id: version.id,
        name: version.name,
        versionGroupUrl: version.version_group.url,
      });
    });
    this.versionRepository.save(versionsToSave);
  }
}
