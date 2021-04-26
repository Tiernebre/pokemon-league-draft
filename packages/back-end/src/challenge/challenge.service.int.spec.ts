import { getRepository, Repository } from "typeorm";
import { ChallengeEntity } from "./challenge.entity";
import { ChallengeService } from "./challenge.service";
import { seedChallenges } from "./challenge.seed";
import { UserEntity } from "../user/user.entity";
import { seedUsers } from "../user/user.seed";
import { establishDbConnection } from "../test/create-db-connection";

describe("ChallengeService (integration)", () => {
  let challengeService: ChallengeService;
  let challengeRepository: Repository<ChallengeEntity>;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    await establishDbConnection();
    challengeRepository = getRepository(ChallengeEntity);
    userRepository = getRepository(UserEntity);
    await seedChallenges(challengeRepository);
    await seedUsers(userRepository);
  });

  beforeEach(() => {
    challengeService = new ChallengeService(challengeRepository);
  });

  describe("getAllForCurrentUser", () => {
    it("returns all of the challenges that are only tied to a user", async () => {
      const challenges = await challengeRepository.findByIds([1, 3]);
      const user = (await userRepository.findOne()) as UserEntity;
      challenges.forEach((challenge) => {
        challenge.users = Promise.resolve([user]);
      });
      await challengeRepository.save(challenges);
      const challengesFound = await challengeService.getAllForCurrentUser({
        id: user.id,
        accessKey: user.accessKey,
      });
      expect(challengesFound).toHaveLength(2);
      const [firstChallenge, secondChallenge] = challengesFound;
      expect(firstChallenge.id).toEqual(challenges[0].id);
      expect(firstChallenge.name).toEqual(challenges[0].name);
      expect(secondChallenge.id).toEqual(challenges[1].id);
      expect(secondChallenge.name).toEqual(challenges[1].name);
    });
  });
});