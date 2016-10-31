#!/bin/sh

rm -rf dist
mkdir dist

find_source_files() {
  SOURCE_FILES=`find ./$1 -iname "*.md"`
  DIST="dist/${1}"
  BOOK_NAME=$1
  mkdir $DIST
}

build_pdf() {
  pandoc --standalone --smart -o "${DIST}/${BOOK_NAME}.pdf" $SOURCE_FILES
}

build_html() {
  pandoc --standalone -o "${DIST}/${BOOK_NAME}.html" $SOURCE_FILES
}

build_epub() {
  pandoc --standalone -o "${DIST}/${BOOK_NAME}.epub" "${BOOK_NAME}/00-title.txt" $SOURCE_FILES
}

for book in "operator-guide" "mechanics-guide"
do
  find_source_files $book
  build_pdf
  build_html
  build_epub
done

# pandoc --standalone --smart -o ./dist/starspot-operators-guide.pdf $SOURCE_FILES
# echo $SOURCE_FILES
# find ./book \( -iname "*.md" -or -iname "*.txt" \) -exec pandoc --standalone --smart -o ./dist/starspot-operators-guide.pdf {} \+

