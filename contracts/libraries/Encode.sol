// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Base64.sol";

library Encode {
    function file (string memory fileType, bytes memory data) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                "data:", fileType, ";base64,",
                Base64.encode(data)
            )
        );
    }

    function json (bytes memory data) internal pure returns (string memory) {
        return file("application/json", data);
    }

    function svg (bytes memory data) internal pure returns (string memory) {
        return file("image/svg+xml", data);
    }
}
