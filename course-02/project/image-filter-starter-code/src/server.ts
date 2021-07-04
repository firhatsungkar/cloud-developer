import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles, checkURL } from './util/util';
import { requireAuth } from './auth';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get(
    '/filteredimage',
    requireAuth,
    async (req: Request, res: Response) => {
      const { image_url } = req.query;

      if (!image_url) return res.status(400).send('need image_url query.');

      // Check url
      try {
        await checkURL(image_url);
      } catch(error) {
        return res.status(400).send(error.message || 'Invalid image url.');
      }

      try {

        const filteredPath = await filterImageFromURL(image_url);

        const downloadCallback = (error: Error) => {
          if (error) throw new Error(error.message);
          deleteLocalFiles([filteredPath]);
        }

        return res.download(filteredPath, downloadCallback);

      } catch (error) {
        return res.status(500).send(
          error.message || 'Something when wrong.'
        );
      }

    }
  );

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();