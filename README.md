# Turbo - Django & Next.js boilerplate <!-- omit from toc -->

Turbo is a simple bootstrap template for Django and Next.js, combining both frameworks under one monorepository, including best practices.

## Features <!-- omit from toc -->

- **Microsites**: supports several front ends connected to API backend
- **API typesafety**: exported types from backend stored in shared front end package
- **Server actions**: handling form submissions in server part of Next project
- **Tailwind CSS**: built-in support for all front end packages and sites
- **Docker Compose**: start both front end and backend by running `docker compose up`
- **Auth system**: incorporated user authentication based on JWT tokens
- **Profile management**: update profile information from the front end
- **Registrations**: creation of new user accounts (activation not included)
- **Admin theme**: Unfold admin theme with user & group management
- **Custom user model**: extended default Django user model
- **Visual Studio Code**: project already constains VS Code containers and tasks

## Table of contents <!-- omit from toc -->

- [Quickstart](#quickstart)
  - [Environment files configuration](#environment-files-configuration)
  - [Running docker compose](#running-docker-compose)
- [Included dependencies](#included-dependencies)
  - [Backend dependencies](#backend-dependencies)
  - [Front end dependencies](#front-end-dependencies)
- [Front end project structure](#front-end-project-structure)
  - [Adding microsite to docker-compose.yaml](#adding-microsite-to-docker-composeyaml)
- [Authentication](#authentication)
  - [Configuring env variables](#configuring-env-variables)
  - [User accounts on the backend](#user-accounts-on-the-backend)
  - [Authenticated paths on frontend](#authenticated-paths-on-frontend)
- [API calls to backend](#api-calls-to-backend)
  - [API Client](#api-client)
  - [Updating OpenAPI schema](#updating-openapi-schema)
  - [Swagger](#swagger)
  - [Client side requests](#client-side-requests)
- [Test suite](#test-suite)
- [Developing in VS Code](#developing-in-vs-code)

## Quickstart

To start using Turbo, it is needed to clone the repository to your local machine and then run `docker compose`, which will take care about the installation process. The only prerequisite for starting Turbo template is to have `docker compose` installed and preconfiguring files with environment variables.

```bash
git clone https://github.com/unfoldadmin/turbo.git
cd turbo
```

### Environment files configuration

Before you can run `docker compose up`, you have to set up two files with environment variables. Both files are loaded via `docker compose` and variables are available within docker containers.

```bash
cp .env.backend.template .env.backend # set SECRET_KEY and DEBUG=1 for debug mode on
cp .env.frontend.template .env.frontend # set NEXTAUTH_SECRET to a value "openssl rand -base64 32"
```

For more advanced environment variables configuration for the front end, it is recommended to read official [Next.js documentation](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables) about environment variables where it is possible to configure specific variables for each microsite.

On the backend it is possible to use third party libraries for loading environment variables. In case that loading variables through `os.environ` is not fulfilling the requriements, we recommend using [django-environ](https://github.com/joke2k/django-environ) application.

### Running docker compose

```bash
docker compose up
```

After successful installation, it will be possible to access both front end (http://localhost:3000) and backend (http://localhost:8000) part of the system from the browsers.

**NOTE**: Don't forget to change database credentials in docker-compose.yaml and in .env.backend by configuring `DATABASE_PASSWORD`.

## Included dependencies

The general rule when it comes to dependencies is to have minimum of third party applications or plugins to avoid future problems updating the project and keep the maintenance of applications is minimal.

### Backend dependencies

For dependency management in Django application we are using `uv`. When starting the project through the `docker compose` command, it is checked for new dependencies as well. In the case they are not installed, docker will install them before running development server.

- **[djangorestframework](https://github.com/encode/django-rest-framework)** - REST API support
- **[djangorestframework-simplejwt](https://github.com/jazzband/djangorestframework-simplejwt)** - JWT auth for REST API
- **[drf-spectacular](https://github.com/tfranzel/drf-spectacular)** - OpenAPI schema generator
- **[django-unfold](https://github.com/unfoldadmin/django-unfold)** - Admin theme for Django admin panel

Below, you can find a command to install new dependency into backend project.

```bash
docker compose exec api uv add djangorestframework
```

### Front end dependencies

For the frontend project, it is bit more complicated to maintain front end dependencies than in backend part. Dependencies, can be split into two parts. First part are general dependencies available for all projects under packages and apps folders. The second part are dependencies, which are project specific.

- **[next-auth](https://github.com/nextauthjs/next-auth)** - Next.js authentication
- **[react-hook-form](https://github.com/react-hook-form/react-hook-form)** - Handling of React forms
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Tailwind CSS class names helper
- **[zod](https://github.com/colinhacks/zod)** - Schema validation

To install a global dependency for all packages and apps, use `-w` parameter. In case of development package, add `-D` argument to install it into development dependencies.

```bash
docker compose exec web pnpm add react-hook-form -w
```

To install a dependency for specific app or package, use `--filter` to specify particular package.

```bash
docker compose exec web pnpm --filter web add react-hook-form
```

## Front end project structure

Project structure on the front end, it is quite different from the directory hierarchy in the backend. Turbo counts with an option that front end have multiple front ends available on various domains or ports.

```text
frontend
| - apps       // available sites
|   - web      // available next.js project
| - packages   // shared packages between sites
|   - types    // exported types from backend - api
|   - ui       // general ui components
```

The general rule here is, if you want to have some shared code, create new package under packages/ folder. After adding new package and making it available for your website, it is needed to install the new package into website project by running a command below.

```bash
docker compose exec web pnpm --filter web add @frontend/ui
```

### Adding microsite to docker-compose.yaml

If you want to have new website facing customers, create new project under apps/ directory. Keep in mind that `docker-compose.yaml` file must be adjusted to start a new project with appropriate new port.

```yaml
new_microsite:
  command: bash -c "pnpm install -r && pnpm --filter new_microsite dev"
  build:
    context: frontend # Dockerfile can be same
  volumes:
    - ./frontend:/app
  expose:
    - "3001" # different port
  ports:
    - "3001:3001" # different port
  env_file:
    - .env.frontend
  depends_on:
    - api
```

## Authentication

For the authentication, Turbo uses **django-simplejwt** and **next-auth** package to provide simple REST based JWT authentication. On the backend, there is no configuraton related to django-simplejwt so everything is set to default values.

On the front end, next-auth is used to provide credentials authentication. The most important file on the front end related to authentication is `frontend/web/lib/auth.ts` which is containing whole business logic behind authentication.

### Configuring env variables

Before starting using authentication, it is crucial to configure environment variable `NEXTAUTH_SECRET` in .env.frontend file. You can set the value to the output of the command below.

```bash
openssl rand -base64 32
```

### User accounts on the backend

There are two ways how to create new user account in the backend. First option is to run managed command responsible for creating superuser. It is more or less required, if you want to have an access to the Django admin. After running the command below, it will be possible to log in on the front end part of the application.

```bash
docker compose exec api uv run -- python manage.py createsuperuser
```

The second option how to create new user account is to register it on the front end. Turbo provides simple registration form. After account registration, it will be not possible to log in because account is inactive. Superuser needs to access Django admin and activate an account. This is a default behavior provided by Turbo, implementation of special way of account activation is currently out the scope of the project.

### Authenticated paths on frontend

To ensure path is only for authenticated users, it is possible to use `getServerSession` to check the status of user.

This function accepts an argument with authentication options, which can be imported from `@/lib/auth` and contains credentials authentication business logic.

```tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const SomePageForAuthenticatedUsers = async () => {
  const session = await getServerSession(authOptions);

  if (session === null) {
    return redirect("/");
  }

  return <>content</>;
};
```

To require authenticated user account on multiple pages, similar business logic can be applied in `layouts.tsx`.

```tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const AuthenticatedLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = await getServerSession(authOptions);

  if (session === null) {
    return redirect("/");
  }

  return <>{children}</>;
};

export default AuthenticatedLayout;
```

## API calls to backend

Currently Turbo implements Next.js server actions in folder `frontend/apps/web/actions/` responsible for communication with the backend. When the server action is hit from the client, it fetches required data from Django API backend.

### API Client

The query between server action and Django backend is handled by using an API client generated by `openapi-typescript-codegen` package. In Turbo, there is a function `getApiClient` available in `frontend/apps/web/lib/api.ts` which already implements default options and authentication tokens.

### Updating OpenAPI schema

After changes on the backend, for example adding new fields into serializers, it is required to update typescript schema on the frontend. The schema can be updated by running command below. In VS Code, there is prepared task which will update definition.

```bash
docker compose exec web pnpm openapi:generate
```

### Swagger

By default, Turbo includes Swagger for API schema which is available here `http://localhost:8000/api/schema/swagger-ui/`. Swagger can be disabled by editing `urls.py` and removing `SpectacularSwaggerView`.

### Client side requests

At the moment, Turbo does not contain any examples of client side requests towards the backend. All the requests are handled by server actions. For client side requests, it is recommended to use [react-query](https://github.com/TanStack/query).

## Test suite

Project contains test suite for backend part. For testing it was used library called [pytest](https://docs.pytest.org/en/latest/) along with some additinal libraries extending functionality of pytest:

- [pytest-django](https://pytest-django.readthedocs.io/en/latest/) - for testing django applications
- [pytest-factoryboy](https://pytest-factoryboy.readthedocs.io/en/latest/) - for creating test data

All these libraries mentioned above are already preconfigured in `backend/api/tests` directory.

- `conftest.py` - for configuring pytest
- `factories.py` - for generating reusable test objects using factory_boy, which creates model instances with default values that can be customized as needed
- `fixtures.py` - for creating pytest fixtures that provide test data or resources that can be shared and reused across multiple tests

To run tests, use the command below which will collect all the tests available in backend/api/tests folder:

```bash
docker compose exec api uv run -- pytest .
```

Tu run tests available only in one specific file run:

```bash
docker compose exec api uv run -- pytest api/tests/test_api.py
```

To run one specific test, use the command below:

```bash
docker compose exec api uv run -- pytest api/tests/test_api.py -k "test_api_users_me_authorized"
```

## Developing in VS Code

The project contains configuration files for devcontainers so it is possible to directly work inside the container within VS Code. When the project opens in the VS Code the popup will appear to reopen the project in container. An action **Dev Containers: Reopen in Container** is available as well. Click on the reopen button and select the container which you want to work on. When you want to switch from the frontend to the backend project run **Dev Containers: Switch container** action. In case you are done and you want to work in the parent folder run **Dev Containers: Reopen Folder Locally** action
