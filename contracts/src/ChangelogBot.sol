// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ChangelogBot
/// @notice Append-only registry of release notes published for GitHub repositories.
///         No tokens, no payments, no admin: anyone can record a release, nobody can edit it.
contract ChangelogBot {
    struct Release {
        address publisher;
        string repo; // "owner/repo" as typed by the publisher
        string version; // e.g. "v1.4.0" (max 20 bytes)
        bytes20 fromCommit;
        bytes20 toCommit;
        bytes32 notesHash; // keccak256 of the canonical notes JSON
        string cid; // IPFS CID of the notes JSON
        bool verified; // .changelogbot check result reported by the app
        uint64 at;
    }

    uint256 public constant MAX_VERSION_LENGTH = 20;
    uint256 public constant MAX_REPO_LENGTH = 140; // 39 (owner) + 1 + 100 (repo)
    uint256 public constant MAX_CID_LENGTH = 100;

    Release[] public releases;

    /// repoKey = keccak256(lowercase(repo)) => release ids
    mapping(bytes32 => uint256[]) private releasesOfRepo;
    /// publisher => release ids
    mapping(address => uint256[]) private releasesOfPublisher;
    /// repoKey => keccak256(publisher, version) => already published
    mapping(bytes32 => mapping(bytes32 => bool)) public versionUsed;

    uint256 public totalRepos;

    event Published(
        uint256 indexed id,
        string repo,
        string version,
        address indexed publisher,
        bool verified
    );

    error EmptyRepo();
    error RepoTooLong();
    error EmptyVersion();
    error VersionTooLong();
    error EmptyCid();
    error CidTooLong();
    error VersionAlreadyPublished();
    error ReleaseNotFound();
    error NoReleasesForRepo();

    function publish(
        string calldata repo,
        string calldata version,
        bytes20 fromCommit,
        bytes20 toCommit,
        bytes32 notesHash,
        string calldata cid,
        bool verified
    ) external returns (uint256 id) {
        _validate(repo, version, cid);
        id = _register(repo, version);

        {
            Release storage r = releases.push();
            r.publisher = msg.sender;
            r.repo = repo;
            r.version = version;
            r.fromCommit = fromCommit;
            r.toCommit = toCommit;
            r.notesHash = notesHash;
            r.cid = cid;
            r.verified = verified;
            r.at = uint64(block.timestamp);
        }

        emit Published(id, repo, version, msg.sender, verified);
    }

    // ---------------------------------------------------------------- views

    function total() external view returns (uint256) {
        return releases.length;
    }

    function getRelease(uint256 id) external view returns (Release memory) {
        if (id >= releases.length) revert ReleaseNotFound();
        return releases[id];
    }

    /// @notice All releases of a repo (case-insensitive), oldest first.
    function releasesFor(string calldata repo) external view returns (Release[] memory) {
        return _load(releasesOfRepo[repoKey(repo)]);
    }

    /// @notice Newest release of a repo. Reverts if none exists.
    function latestFor(string calldata repo) external view returns (Release memory) {
        uint256[] storage ids = releasesOfRepo[repoKey(repo)];
        if (ids.length == 0) revert NoReleasesForRepo();
        return releases[ids[ids.length - 1]];
    }

    /// @notice All releases published by an address, oldest first.
    function releasesBy(address publisher) external view returns (Release[] memory) {
        return _load(releasesOfPublisher[publisher]);
    }

    /// @notice Key used for repo lookups: keccak256 of the lowercased repo string.
    function repoKey(string calldata repo) public pure returns (bytes32) {
        bytes memory b = bytes(repo);
        bytes memory lower = new bytes(b.length);
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            lower[i] = (c >= 0x41 && c <= 0x5A) ? bytes1(uint8(c) + 32) : c;
        }
        return keccak256(lower);
    }

    function _validate(
        string calldata repo,
        string calldata version,
        string calldata cid
    ) private pure {
        uint256 repoLen = bytes(repo).length;
        if (repoLen == 0) revert EmptyRepo();
        if (repoLen > MAX_REPO_LENGTH) revert RepoTooLong();

        uint256 versionLen = bytes(version).length;
        if (versionLen == 0) revert EmptyVersion();
        if (versionLen > MAX_VERSION_LENGTH) revert VersionTooLong();

        uint256 cidLen = bytes(cid).length;
        if (cidLen == 0) revert EmptyCid();
        if (cidLen > MAX_CID_LENGTH) revert CidTooLong();
    }

    /// @dev Marks the version as used and indexes the next release id. Returns that id.
    function _register(string calldata repo, string calldata version) private returns (uint256 id) {
        bytes32 key = repoKey(repo);
        bytes32 versionKey = keccak256(abi.encodePacked(msg.sender, version));
        if (versionUsed[key][versionKey]) revert VersionAlreadyPublished();
        versionUsed[key][versionKey] = true;

        id = releases.length;
        if (releasesOfRepo[key].length == 0) totalRepos++;
        releasesOfRepo[key].push(id);
        releasesOfPublisher[msg.sender].push(id);
    }

    function _load(uint256[] storage ids) private view returns (Release[] memory out) {
        out = new Release[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            out[i] = releases[ids[i]];
        }
    }
}
