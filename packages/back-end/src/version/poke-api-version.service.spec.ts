jest.mock("../http", () => ({
  fetchOk: jest.fn(),
}));

import { HttpClient } from "../http";
import { PokeApiVersionService } from "./poke-api-version.service";
import { matchers, object, verify, when } from "testdouble";
import {
  generateMockPokeApiPokedex,
  generateMockPokeApiVersion,
  generateMockPokeApiVersionGroup,
} from "../poke-api/games.mock";
import { fetchOk } from "../http";
import { when as jestWhen } from "jest-when";
import {
  mapPokedexFromPokeApi,
  mapVersionFromEntity,
  mapVersionFromPokeApi,
} from "./version.mapper";
import { Repository } from "typeorm";
import { VersionDeniedPokemonEntity } from "./version-denied-pokemon.entity";
import {
  generateMockVersionDeniedPokemon,
  generateMockVersionEntity,
} from "./version.mock";
import { Logger } from "../logger";
import { VersionEntity } from "./version.entity";

const mockedFetchOk = fetchOk as unknown as jest.Mock;

describe("PokeApiVersionService", () => {
  let pokeApiVersionService: PokeApiVersionService;
  let pokeApiHttpClient: HttpClient;
  let repository: Repository<VersionEntity>;

  beforeEach(() => {
    pokeApiHttpClient = object<HttpClient>();
    repository = object<Repository<VersionEntity>>();
    pokeApiVersionService = new PokeApiVersionService(
      pokeApiHttpClient,
      object<Logger>(),
      repository
    );
    mockedFetchOk.mockReset();
  });

  describe("getOneById", () => {
    it("returns a found version", async () => {
      const pokeApiVersion = generateMockPokeApiVersion();
      when(pokeApiHttpClient.get(`version/${pokeApiVersion.id}`)).thenResolve(
        pokeApiVersion
      );
      const versionDeniedList = [
        generateMockVersionDeniedPokemon(),
        generateMockVersionDeniedPokemon(),
      ];
      const gotten = await pokeApiVersionService.getOneById(pokeApiVersion.id);
      const expected = mapVersionFromPokeApi(
        pokeApiVersion,
        versionDeniedList.map(({ pokemonId }) => pokemonId)
      );
      expect(gotten).toEqual(expected);
    });
  });

  describe("getPokedexFromOneWithId", () => {
    it("returns an associated pokedex from a given version id", async () => {
      const version = generateMockPokeApiVersion();
      const versionGroup = generateMockPokeApiVersionGroup();
      const pokedex = generateMockPokeApiPokedex();
      when(pokeApiHttpClient.get(`version/${version.id}`)).thenResolve(version);
      jestWhen(mockedFetchOk)
        .calledWith(version.version_group.url)
        .mockResolvedValue(versionGroup);
      jestWhen(mockedFetchOk)
        .calledWith(versionGroup.pokedexes[0].url)
        .mockResolvedValue(pokedex);
      const gotten = await pokeApiVersionService.getPokedexFromOneWithId(
        version.id
      );
      expect(gotten).toEqual(mapPokedexFromPokeApi(pokedex));
    });
  });

  describe("getPokedexFromOne", () => {
    it("returns an associated pokedex from a given version", async () => {
      const version = generateMockPokeApiVersion();
      const versionGroup = generateMockPokeApiVersionGroup();
      const pokedex = generateMockPokeApiPokedex();
      jestWhen(mockedFetchOk)
        .calledWith(version.version_group.url)
        .mockResolvedValue(versionGroup);
      jestWhen(mockedFetchOk)
        .calledWith(versionGroup.pokedexes[0].url)
        .mockResolvedValue(pokedex);
      const gotten = await pokeApiVersionService.getPokedexFromOne(
        mapVersionFromPokeApi(version)
      );
      expect(gotten).toEqual(mapPokedexFromPokeApi(pokedex));
    });
  });

  describe("getAll", () => {
    it("fetches and caches versions onto the database if none exist", async () => {
      when(repository.count()).thenResolve(0);
      when(pokeApiHttpClient.get("version?limit=100")).thenResolve({
        results: [
          {
            id: 1,
            url: "localhost:1234",
          },
        ],
      });
      const mockVersion = generateMockPokeApiVersion();
      jestWhen(mockedFetchOk)
        .calledWith("localhost:1234")
        .mockResolvedValue(mockVersion);
      const expectedEntity = generateMockVersionEntity();
      when(
        repository.create({
          id: mockVersion.id,
          name: mockVersion.name,
          versionGroupUrl: mockVersion.version_group.url,
        })
      ).thenReturn(expectedEntity);
      when(repository.find()).thenResolve([expectedEntity]);
      const gottenVersions = await pokeApiVersionService.getAll();
      verify(repository.save([expectedEntity]));
      expect(gottenVersions).toEqual([mapVersionFromEntity(expectedEntity)]);
    });

    it("does not cache if versions already exist", async () => {
      when(repository.count()).thenResolve(1);
      const expectedEntities = [generateMockVersionEntity()];
      when(repository.find()).thenResolve(expectedEntities);
      const gottenVersions = await pokeApiVersionService.getAll();
      verify(repository.save(matchers.anything()), { times: 0 });
      expect(gottenVersions).toEqual(
        expectedEntities.map(mapVersionFromEntity)
      );
    });
  });

  describe("cacheAll", () => {
    it("fetches and caches versions in the database", async () => {
      when(pokeApiHttpClient.get("version?limit=100")).thenResolve({
        results: [
          {
            id: 1,
            url: "localhost:1234",
          },
        ],
      });
      const mockVersion = generateMockPokeApiVersion();
      jestWhen(mockedFetchOk)
        .calledWith("localhost:1234")
        .mockResolvedValue(mockVersion);
      const expectedEntity = generateMockVersionEntity();
      when(
        repository.create({
          id: mockVersion.id,
          name: mockVersion.name,
          versionGroupUrl: mockVersion.version_group.url,
        })
      ).thenReturn(expectedEntity);
      await pokeApiVersionService.cacheAll();
      verify(repository.save([expectedEntity]));
    });
  });
});
