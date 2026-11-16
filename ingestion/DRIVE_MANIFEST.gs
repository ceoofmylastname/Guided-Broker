/**
 * GuidedBroker — Resource Center link manifest generator.
 *
 * HOW TO RUN (one time, ~1 minute):
 *  1. Go to https://script.google.com  (logged in as the account that owns the
 *     Resource Center, e.g. training@protectnv.com).
 *  2. New project. Delete the sample code. Paste THIS whole file in.
 *  3. Press Run (▶). Authorize when prompted. NOTE: this is NOT read-only. It
 *     sets every file it visits (everything except '- Corporate') to "anyone
 *     with the link can view" so agents' links open. Then it writes a CSV.
 *  4. When it finishes, check your Google Drive "My Drive" for a new file:
 *     resource_center_manifest.csv  — download it.
 *  5. Drop that CSV into your repo at: ingestion/resource_center_manifest.csv
 *
 * It walks the entire Resource Center folder and lists every file with its
 * folder path, name, id, type, and real share link. The bot uses these links.
 */

function exportResourceCenterManifest() {
  var ROOT_ID = '1OGSRZXtjxVdGrihzuFBLDM8EXNhAKp-n'; // '- MIRROR TO ACTUAL RC'
  var rows = [['path', 'name', 'fileId', 'mimeType', 'shareUrl', 'shared']];
  var root = DriveApp.getFolderById(ROOT_ID);

  // Make sure the whole tree is "anyone with the link" so the bot's links open
  // and the ingest script can read each file.
  // Do NOT share the root itself: link-sharing a folder cascades to every
  // child, which would expose '- Corporate'. Each non-skipped item is shared
  // individually in the walk instead.

  walk_(root, 'Resource Center', rows);

  var csv = rows.map(function (r) {
    return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\n');

  var file = DriveApp.createFile('resource_center_manifest.csv', csv, MimeType.CSV);
  Logger.log('Files listed: ' + (rows.length - 1));
  Logger.log('Share failures: ' + SHARE_FAILS + '  |  Shortcuts: ' + SHORTCUTS);
  Logger.log('Download this CSV from your Drive: ' + file.getUrl());
}

var SKIP_IDS = { '10hp_qiRx90q3VudMPEF9EzwDKZ2shkxl': true }; // '- Corporate' — agents must never see this

var SHARE_FAILS = 0;
var SHORTCUTS = 0;

function walk_(folder, path, rows) {
  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    var shared = 'yes';
    try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); }
    catch (e) { shared = 'FAILED: ' + e.message; SHARE_FAILS++; }
    if (f.getMimeType() === 'application/vnd.google-apps.shortcut') SHORTCUTS++;
    rows.push([path, f.getName(), f.getId(), f.getMimeType(), f.getUrl(), shared]);
  }
  var subs = folder.getFolders();
  while (subs.hasNext()) {
    var sf = subs.next();
    if (SKIP_IDS[sf.getId()]) continue;
    walk_(sf, path + '/' + sf.getName(), rows);
  }
}
