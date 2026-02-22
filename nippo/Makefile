.PHONY: help install dev build start clean test lint format db-migrate db-seed docker-build docker-run deploy

# Variables
PROJECT_ID ?= XXXX
SERVICE_NAME = nippo-system
REGION = asia-northeast1
PORT = 8080

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm run start

clean: ## Clean build artifacts and dependencies
	rm -rf node_modules .next out dist coverage
	rm -rf playwright-report test-results

test: ## Run all tests
	npm run type-check
	npm run lint
	npm run test
	npm run test:e2e

test-unit: ## Run unit tests only
	npm run test

test-e2e: ## Run E2E tests only
	npm run test:e2e

test-coverage: ## Run tests with coverage
	npm run test:coverage

lint: ## Run linter
	npm run lint

lint-fix: ## Fix linting errors
	npm run lint:fix

format: ## Format code
	npm run format

db-generate: ## Generate Prisma Client
	npm run db:generate

db-migrate: ## Run database migrations
	npm run db:migrate

db-seed: ## Seed database
	npm run db:seed

db-studio: ## Open Prisma Studio
	npm run db:studio

db-reset: ## Reset database
	npm run db:reset

docker-build: ## Build Docker image
	docker build -t $(SERVICE_NAME):latest \
		--build-arg DATABASE_URL=${DATABASE_URL} \
		--build-arg JWT_SECRET=${JWT_SECRET} \
		.

docker-run: ## Run Docker container
	docker run -p $(PORT):$(PORT) \
		-e DATABASE_URL=${DATABASE_URL} \
		-e JWT_SECRET=${JWT_SECRET} \
		-e PORT=$(PORT) \
		$(SERVICE_NAME):latest

gcloud-auth: ## Authenticate with Google Cloud
	gcloud auth login
	gcloud config set project $(PROJECT_ID)

gcloud-build: ## Build image on Google Cloud Build
	gcloud builds submit --tag gcr.io/$(PROJECT_ID)/$(SERVICE_NAME)

deploy: ## Deploy to Cloud Run
	gcloud run deploy $(SERVICE_NAME) \
		--image gcr.io/$(PROJECT_ID)/$(SERVICE_NAME) \
		--platform managed \
		--region $(REGION) \
		--port $(PORT) \
		--allow-unauthenticated \
		--set-env-vars "NODE_ENV=production" \
		--set-env-vars "DATABASE_URL=${DATABASE_URL}" \
		--set-env-vars "JWT_SECRET=${JWT_SECRET}" \
		--min-instances 0 \
		--max-instances 10 \
		--memory 512Mi \
		--cpu 1

deploy-full: gcloud-build deploy ## Build and deploy to Cloud Run

ci: ## Run CI pipeline locally
	npm run lint
	npm run type-check
	npm run test
	npm run build
