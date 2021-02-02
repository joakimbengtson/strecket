GITHUB_USER=meg768
GITHUB_PROJECT=strecket
GITHUB_URL=https://github.com/$(GITHUB_USER)/$(GITHUB_PROJECT)
GITHUB_COMMIT_MESSAGE=-

all:
	@echo Specify something

start:
	npx react-scripts start

buildx:
	npx react-scripts build

deploy:
	scp -r ./build/* root@pi-kato:/var/www/html/strecket

git-commit:
	git add -A && git commit -m $(GITHUB_COMMIT_MESSAGE) && git push

git-pull:
	git pull

git-reset:
	git reset --hard HEAD

git-open:
	open $(GITHUB_URL).git

npm-publish:
	npm publish

npm-increase-version:
	npm version patch --no-git-tag-version

npm-open:
	open https://www.npmjs.com/package/$(GITHUB_PROJCT)