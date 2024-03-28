function getFile(filePath, stream, error = (e) => {}) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', filePath, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let lines = xhr.responseText.split('\n');
                lines.forEach(stream);
            } else {
                error('network error: ' + xhr.status);
            }
        }
    };
    xhr.send(null);
}

function getFolderInFileContents(folderPath, stream, error = (e) => {}) {
    try {
        fetch(folderPath)
            .then((response) => {
                return response.text();
            })
            .then((response) => {
                const files = fileList.split('\n');

                (async (stream, files) => {
                    for (const file of files) {
                        const fileResponse = await fetch(
                            `${folderPath}/${file}`
                        );
                        const fileContent = await fileResponse.text();
                        stream(fileContent);
                    }
                })(stream, files);
            });
    } catch (error) {
        error(error);
    }
}

function getLink(link) {
    return window.location.origin + '/' + link;
}

function commonOnload() {
    let rootLink = window.location.origin + '/';
    let gotoTopPageATag = document.createElement('a');

    gotoTopPageATag.href = rootLink;
    gotoTopPageATag.innerHTML = '< トップページに戻る';
    document.body.appendChild(gotoTopPageATag);
}
