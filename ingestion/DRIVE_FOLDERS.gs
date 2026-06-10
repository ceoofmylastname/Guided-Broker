/**
 * GuidedBroker — list every Resource Center FOLDER with its share link.
 * Used to point the bottom "bookshelf" grid buttons at the correct Drive folders.
 *
 * RUN (same as before, ~30 sec):
 *  1. script.google.com → New project → paste this in.
 *  2. Run ▶ (authorize if asked, it's your own script).
 *  3. In My Drive, download the new file: resource_center_folders.csv
 *  4. Drop it into the repo at: ingestion/resource_center_folders.csv
 */
function exportFolderManifest() {
  var ROOT_ID = '12d2zXtY_ii5ao8zhCd4hqMjW_aPjnM_W'; // Resource Center
  var rows = [['path', 'folderId', 'url']];
  var root = DriveApp.getFolderById(ROOT_ID);
  rows.push(['Resource Center', root.getId(), root.getUrl()]);
  walkF_(root, 'Resource Center', rows);

  var csv = rows.map(function (r) {
    return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\n');
  var file = DriveApp.createFile('resource_center_folders.csv', csv, MimeType.CSV);
  Logger.log('Folders listed: ' + (rows.length - 1));
  Logger.log('Download this CSV from your Drive: ' + file.getUrl());
}

function walkF_(folder, path, rows) {
  var subs = folder.getFolders();
  while (subs.hasNext()) {
    var sf = subs.next();
    try { sf.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
    var p = path + '/' + sf.getName();
    rows.push([p, sf.getId(), sf.getUrl()]);
    walkF_(sf, p, rows);
  }
}
