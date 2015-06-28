all: html

html: clean
	node ../../bin/seagull.js

add-html-and-commit:
	find . -name '*~' -delete
	git add html
	git commit -m 'Update test/empty html'

clean:
	rm -rf html
	mkdir html
	find . -name '*~' -delete
