import Koa from "koa";
import supertest from "supertest";
import { Server } from "http";
import Application from "koa";
import { object, when } from "testdouble";
import { VersionService } from "./version.service";
import { VersionRouter } from "./version.router";
import { Version } from "./version";
import { generateMockVersion } from "./version.mock";
import { NO_CONTENT } from "http-status";

describe("Version Router (integration)", () => {
  let app: Application;
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;
  let versionService: VersionService;

  beforeAll(() => {
    app = new Koa();
    versionService = object<VersionService>();
    const router = new VersionRouter(versionService);
    app.use(router.routes());

    server = app.listen();

    request = supertest(server);
  });

  afterAll(() => {
    server.close();
  });

  describe("GET /versions", () => {
    const uri = "/versions";

    it("returns with 200 OK status", async () => {
      const versions: Version[] = [generateMockVersion()];
      when(versionService.getAll()).thenResolve(versions);
      const response = await request.get(uri).send();
      expect(response.status).toEqual(200);
    });

    it("returns with found challenges in the response body", async () => {
      const versions: Version[] = [generateMockVersion()];
      when(versionService.getAll()).thenResolve(versions);
      const response = await request.get(uri).send();
      const body = response.body as Version[];
      expect(body).toHaveLength(versions.length);
      expect(body[0].id).toEqual(versions[0].id);
    });
  });

  describe("POST /versions-cache", () => {
    const uri = "/versions-cache";

    it("returns with 204 NO CONTENT status", async () => {
      when(versionService.cacheAllFromPokeApi()).thenResolve();
      const response = await request.post(uri).send();
      expect(response.status).toEqual(NO_CONTENT);
    });
  });
});
