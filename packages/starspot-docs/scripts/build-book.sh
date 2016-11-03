#!/bin/sh

rm -rf dist
mkdir dist

find_source_files() {
  echo "\033[34mBuilding ${1}\033[0m"
  SOURCE_FILES=`find ./$1 -iname "*.md"`
  DIST="dist/${1}"
  BOOK_NAME=$1
  mkdir $DIST
}

echo_file() {
  printf '  %-14s-> \e[36m%s\e[0m\n' "Building ${1}" "${2}"
}

build_pdf() {
  local pdf="${DIST}/${BOOK_NAME}.pdf"
  echo_file "pdf" "${pdf}"
  pandoc --standalone --smart --output="${pdf}" $SOURCE_FILES
}

build_html() {
  local html="${DIST}/${BOOK_NAME}.html"
  echo_file "html" "${html}"
  pandoc --standalone --toc --css="../../assets/book.css" --output="${html}" $SOURCE_FILES
}

build_epub() {
  local epub="${DIST}/${BOOK_NAME}.epub"
  echo_file "epub" "${epub}"
  pandoc --standalone --output="${epub}" "${BOOK_NAME}/00-title.txt" $SOURCE_FILES
}

for book in "operator-guide" "mechanics-guide"
do
  find_source_files $book
  build_html
  build_epub
  build_pdf
  echo
done