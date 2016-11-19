#!/bin/sh

main() {
  find_output_directory
  rm -rf $DIST

  for book in "operator-guide" "mechanics-guide"
  do
    find_source_files $book
    build_html
    build_epub
    build_pdf
    echo
  done

  build_index
}

ASSETS="../../assets"

find_current_tag() {
  echo "Looking for git tags pointing at HEAD..."

  local tag_count=$(git tag --points-at HEAD | grep "v.*" | wc -l | bc)

  if [ $tag_count -gt 1 ]
  then
    echo "\033[31mMore than one matching version tag:\n"
    echo "$(git tag --points-at HEAD | grep "v.*")\n"
    echo "Aborting"
    exit 1
  elif [ $tag_count -eq 1 ]
  then
    CURRENT_TAG=$(git tag --points-at HEAD | grep "v.*")
  else
    CURRENT_TAG=""
  fi
}

find_output_directory() {
  find_current_tag

  if [ $CURRENT_TAG ]
  then
    echo "Found version tag \033[1;35m${CURRENT_TAG}\033[0m\n"
    REV=$CURRENT_TAG}
    DIST="dist/${CURRENT_TAG}"
  else
    REV=$(git rev-parse --short HEAD)
    echo "No tag found for HEAD, using rev \033[1;35m${REV}\033[0m \n"
    DIST="dist/${REV}"
  fi
}

find_source_files() {
  echo "\033[34mBuilding ${1}\033[0m"
  SOURCE_FILES=`find ./$1 -iname "*.md"`
  BOOK_NAME=$1
  BOOK_DIST="${DIST}/${BOOK_NAME}"
  mkdir -p $BOOK_DIST
}

echo_file() {
  printf '  %-14s-> \e[36m%s\e[0m\n' "Building ${1}" "${2}"
}

build_pdf() {
  local pdf="${BOOK_DIST}/${BOOK_NAME}.pdf"
  echo_file "pdf" "${pdf}"
  pandoc --standalone --smart --output="${pdf}" $SOURCE_FILES
}

build_html() {
  local html="${BOOK_DIST}/index.html"
  echo_file "html" "${html}"

  cp assets/book.css ${BOOK_DIST}/book.css

  pandoc --to=html5 \
    --template="assets/template.html5" \
    --standalone \
    --toc \
    --toc-depth=3 \
    --css="book.css" \
    --output="${html}" \
    --verbose \
    "${BOOK_NAME}/00-title.txt" $SOURCE_FILES
}

build_epub() {
  local epub="${BOOK_DIST}/${BOOK_NAME}.epub"
  echo_file "epub" "${epub}"
  pandoc --standalone --output="${epub}" "${BOOK_NAME}/00-title.txt" $SOURCE_FILES
}

build_index() {
  cp assets/listing.html dist/index.html
  sed -e "s/\${REV}/${REV}/" assets/listing.html > dist/index.html
}

main