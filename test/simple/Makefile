all: html

html: clean
	node ../../bin/seagull.js

clean:
	rm -rf html
	mkdir html
	find . -name '*~' -delete
